import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PERIWINKLE = new THREE.Color("#736CED");
const LAVENDER = new THREE.Color("#9FA2E8");
const WHITE = new THREE.Color("#FFFFFF");

const RADIUS = 1.6;

/** Evenly distributed points on a sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    c.copy(LAVENDER).lerp(PERIWINKLE, Math.random() * 0.8);
    if (Math.random() > 0.94) c.copy(WHITE);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  return { positions, colors };
}

function randomOnSphere(radius: number) {
  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return new THREE.Vector3(Math.cos(t) * r, u, Math.sin(t) * r).multiplyScalar(radius);
}

/** Soft round sprite so points render as dots instead of squares. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }, []);
}

function DotGlobe() {
  const { positions, colors } = useMemo(() => fibonacciSphere(2600, RADIUS), []);
  const map = useDotTexture();
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        map={map}
        alphaTest={0.05}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Fresnel rim glow around the globe. */
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: PERIWINKLE } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            // Back faces: strongest just outside the planet's rim, fading to the halo edge
            float f = pow(clamp(-dot(vNormal, vView) * 1.7, 0.0, 1.0), 2.2);
            gl_FragColor = vec4(uColor, f * 0.75);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  return (
    <mesh material={material} scale={1.22}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
    </mesh>
  );
}

/** Great-circle style arcs connecting random points with a travelling pulse. */
function Arcs({ count = 14 }: { count?: number }) {
  const arcs = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: LAVENDER,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    return Array.from({ length: count }, () => {
      const a = randomOnSphere(RADIUS);
      const b = randomOnSphere(RADIUS);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const lift = RADIUS + a.distanceTo(b) * 0.45;
      mid.normalize().multiplyScalar(lift);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      return { curve, line, speed: 0.12 + Math.random() * 0.2, offset: Math.random() };
    });
  }, [count]);

  const pulses = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    arcs.forEach((arc, i) => {
      const m = pulses.current[i];
      if (!m) return;
      const p = (t * arc.speed + arc.offset) % 1;
      m.position.copy(arc.curve.getPoint(p));
      const s = Math.sin(p * Math.PI);
      m.scale.setScalar(0.4 + s);
    });
  });

  return (
    <group>
      {arcs.map((arc, i) => (
        <group key={i}>
          <primitive object={arc.line} />
          <mesh ref={(el) => (pulses.current[i] = el)}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  speed,
  color,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: THREE.Color;
}) {
  const sat = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    sat.current?.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.0035, 8, 200]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh ref={sat}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

function Starfield({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const map = useDotTexture();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = randomOnSphere(6 + Math.random() * 10);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={map}
        color={LAVENDER}
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.08;
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -pointer.y * 0.25 + 0.25,
        0.04,
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        pointer.x * 0.12,
        0.04,
      );
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        scrollY * 0.0012,
        0.08,
      );
    }
  });
  return (
    <group ref={group}>
      <group ref={spin}>{children}</group>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Starfield />
      <Rig>
        {/* Opaque core hides back-side dots and the halo behind the planet */}
        <mesh>
          <sphereGeometry args={[RADIUS * 0.985, 64, 64]} />
          <meshBasicMaterial color="#070818" />
        </mesh>
        <DotGlobe />
        <Arcs />
        <Atmosphere />
      </Rig>
      <OrbitRing radius={2.35} tilt={[0.35, 0, 0.2]} speed={0.35} color={PERIWINKLE} />
      <OrbitRing radius={2.75} tilt={[-0.25, 0.4, -0.35]} speed={-0.22} color={LAVENDER} />
    </Canvas>
  );
}
