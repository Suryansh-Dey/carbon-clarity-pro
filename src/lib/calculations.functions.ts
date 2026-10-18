import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/integrations/auth/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

const SaveSchema = z.object({
  saved_name: z.string().trim().max(120).optional().nullable(),
  scope: z.string().min(1),
  category: z.string().min(1),
  product_name: z.string().min(1),
  quantity: z.number().positive().finite(),
  unit: z.string().min(1),
  co2_kg: z.number().nonnegative(),
  ch4_kg: z.number().nonnegative(),
  n2o_kg: z.number().nonnegative(),
  co2e_kg: z.number().nonnegative(),
  ef_source: z.string().max(300),
  ef_details: z.record(z.string(), z.any()).optional(),
  company: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export interface CalculationRow {
  id: string;
  user_id: string;
  saved_name: string | null;
  scope: string;
  category: string;
  product_name: string;
  quantity: number;
  unit: string;
  co2_kg: number;
  ch4_kg: number;
  n2o_kg: number;
  co2e_kg: number;
  ef_source: string | null;
  ef_details: Json | null;
  company: string | null;
  facility: string | null;
  notes: string | null;
  created_at: string;
}

let localCalculations: CalculationRow[] = [];

type ProfileRecord = {
  id: string;
  full_name: string | null;
  company: string | null;
  facility: string | null;
  created_at: string;
};

const localProfiles = new Map<string, ProfileRecord>();

// Helper to lazily import the Supabase admin client (for database operations only)
async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Validates whether the user is an administrator via ADMIN_EMAILS environment
 * variable or Supabase user_roles table.
 */
async function checkUserIsAdmin(userId: string, userEmail?: string): Promise<boolean> {
  // 1. Check ADMIN_EMAILS environment variable
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (adminEmailsEnv && userEmail) {
    const adminEmails = adminEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(userEmail.toLowerCase())) {
      return true;
    }
  }

  // 2. Check Supabase user_roles table
  try {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!error && data?.role === "admin") {
      return true;
    }
  } catch {
    // Supabase unavailable or not yet configured
  }

  return false;
}

export const saveCalculation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }): Promise<CalculationRow> => {
    const { userId } = context;
    try {
      const supabase = await getSupabaseAdmin();
      const { data: row, error } = await supabase
        .from("calculations")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (!error && row) return row as CalculationRow;
    } catch {
      // fallback
    }

    const newRow: CalculationRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      saved_name: data.saved_name ?? null,
      scope: data.scope,
      category: data.category,
      product_name: data.product_name,
      quantity: data.quantity,
      unit: data.unit,
      co2_kg: data.co2_kg,
      ch4_kg: data.ch4_kg,
      n2o_kg: data.n2o_kg,
      co2e_kg: data.co2e_kg,
      ef_source: data.ef_source,
      ef_details: (data.ef_details as Json) ?? null,
      company: data.company ?? null,
      facility: data.facility ?? null,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
    };
    localCalculations.unshift(newRow);
    return newRow;
  });

export const listMyCalculations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<CalculationRow[]> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && data) return data as CalculationRow[];
    } catch {
      // fallback
    }
    // Tenant-isolated in-memory fallback
    return localCalculations.filter((c) => c.user_id === context.userId);
  });

export const deleteCalculation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    try {
      const supabase = await getSupabaseAdmin();
      await supabase.from("calculations").delete().eq("id", data.id).eq("user_id", context.userId);
    } catch {
      // fallback
    }
    // Tenant-isolated in-memory delete
    localCalculations = localCalculations.filter(
      (c) => !(c.id === data.id && c.user_id === context.userId),
    );
    return { ok: true };
  });

export const getCalculation = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<CalculationRow> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data: row, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .single();
      if (!error && row) return row as CalculationRow;
    } catch {
      // fallback
    }
    const found = localCalculations.find((c) => c.id === data.id && c.user_id === context.userId);
    if (!found) {
      throw new Error("Calculation not found or unauthorized access.");
    }
    return found;
  });

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<CalculationRow[]> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as CalculationRow[];
    } catch {
      // fallback
    }
    return localCalculations.filter((c) => c.user_id === context.userId);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<ProfileRecord> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", context.userId)
        .maybeSingle();
      if (!error && data) return data as ProfileRecord;
    } catch {
      // fallback
    }
    return (
      localProfiles.get(context.userId) ?? {
        id: context.userId,
        full_name: context.userName || "Demo User",
        company: "Climate Social Mumbai",
        facility: "Headquarters",
        created_at: new Date().toISOString(),
      }
    );
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        full_name: z.string().trim().max(120).optional(),
        company: z.string().trim().max(200).optional(),
        facility: z.string().trim().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    try {
      const supabase = await getSupabaseAdmin();
      await supabase.from("profiles").update(data).eq("id", context.userId);
    } catch {
      // fallback
    }
    const current = localProfiles.get(context.userId) ?? {
      id: context.userId,
      full_name: context.userName || "Demo User",
      company: null,
      facility: null,
      created_at: new Date().toISOString(),
    };
    localProfiles.set(context.userId, {
      ...current,
      ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.facility !== undefined ? { facility: data.facility } : {}),
    });
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const isAdmin = await checkUserIsAdmin(context.userId, context.userEmail);
    return { isAdmin };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      profiles: ProfileRecord[];
      calculations: CalculationRow[];
    }> => {
      const isAdmin = await checkUserIsAdmin(context.userId, context.userEmail);
      if (!isAdmin) {
        throw new Error("Forbidden: Administrator privileges required.");
      }

      try {
        const supabase = await getSupabaseAdmin();
        const [{ data: profiles }, { data: calcs }] = await Promise.all([
          supabase.from("profiles").select("id,full_name,company,facility,created_at"),
          supabase
            .from("calculations")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1000),
        ]);
        if (profiles && calcs)
          return {
            profiles: profiles as ProfileRecord[],
            calculations: calcs as CalculationRow[],
          };
      } catch {
        // fallback
      }
      return {
        profiles: Array.from(localProfiles.values()),
        calculations: localCalculations,
      };
    },
  );
