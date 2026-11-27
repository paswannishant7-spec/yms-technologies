"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { CanvasTexture, Color, Group, MathUtils, Quaternion, SRGBColorSpace, Vector3, type Texture } from "three";
import { productViews, scenes, type SceneId } from "@/content/scenes";

type PlateProps = ThreeElements["group"] & {
  size: [number, number, number];
  radius?: number;
  color?: string;
  metal?: number;
  roughness?: number;
};

function Plate({ size, radius = 0.07, color = "#284566", metal = 0.55, roughness = 0.29, ...position }: PlateProps) {
  return (
    <group {...position}>
      <RoundedBox args={size} radius={radius} smoothness={3}>
        <meshStandardMaterial color={color} metalness={metal} roughness={roughness} />
      </RoundedBox>
    </group>
  );
}

function Edge({ from, to, color, radius = 0.012 }: {
  from: [number, number, number]; to: [number, number, number]; color: string; radius?: number;
}) {
  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const delta = end.clone().sub(start);
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  return (
    <mesh position={start.lerp(end, 0.5)} quaternion={rotation}>
      <cylinderGeometry args={[radius, radius, delta.length(), 8]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.32} emissive={color} emissiveIntensity={0.16} />
    </mesh>
  );
}

function Surface({ map, width, height, depth, glow = 0 }: { map: Texture; width: number; height: number; depth: number; glow?: number }) {
  return (
    <mesh position={[0, 0, depth]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={glow} roughness={0.71} />
    </mesh>
  );
}

function paintInterface(kind: "mobile" | "web" | "browser" | "small") {
  const canvas = document.createElement("canvas");
  const portrait = kind === "mobile" || kind === "small";
  canvas.width = portrait ? 512 : 768;
  canvas.height = portrait ? 1024 : 496;
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext("2d")!;
  const fill = (x: number, y: number, width: number, height: number, radius: number, color: string | CanvasGradient) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  };
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, portrait ? "#193b72" : "#422534");
  gradient.addColorStop(0.54, portrait ? "#08182f" : "#1e1424");
  gradient.addColorStop(1, "#080f1e");
  fill(0, 0, w, h, 28, gradient);
  const accent = portrait ? "#78b7ff" : "#ff657d";
  ctx.globalAlpha = 0.19;
  for (let x = 0; x < w; x += 44) fill(x, 0, 1, h, 0, accent);
  for (let y = 0; y < h; y += 44) fill(0, y, w, 1, 0, accent);
  ctx.globalAlpha = 1;
  const ink = "#e2f0fb";
  if (kind === "mobile" || kind === "web") {
    const top = portrait ? 69 : 52;
    ctx.fillStyle = ink;
    ctx.font = '700 25px system-ui';
    ctx.fillText(portrait ? "INTERFACE LAB" : "YMS / INTERFACE STUDY", 40, top);
    fill(w - 106, top - 20, 65, 19, 8, accent);
    const panel = portrait ? 157 : 113;
    const chartHeight = portrait ? 366 : 240;
    const chartWidth = portrait ? w - 80 : w * 0.57;
    fill(38, panel, chartWidth, chartHeight, 18, "rgba(71,115,157,.28)");
    fill(64, panel + 29, 94, 11, 5, accent);
    fill(65, panel + 56, 130, 7, 3, "#7996b6");
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    [0.65, 0.49, 0.62, 0.38, 0.45, 0.2].forEach((value, index) => {
      const x = 63 + index * (chartWidth - 56) / 5;
      const y = panel + 90 + value * (chartHeight - 96);
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    const cardWidth = portrait ? (w - 104) / 2 : w * 0.24;
    for (let i = 0; i < 4; i++) {
      const x = portrait ? 38 + i % 2 * (cardWidth + 22) : 505;
      const y = portrait ? 560 + Math.floor(i / 2) * 177 : 110 + i * 84;
      fill(x, y, cardWidth, portrait ? 150 : 66, 14, "#244365");
      fill(x + 17, y + 18, 27, 25, 6, accent);
      fill(x + 17, y + (portrait ? 79 : 51), cardWidth * 0.66, 7, 3, "#b0c4d9");
      if (portrait) fill(x + 17, y + 104, cardWidth * 0.8, 6, 3, "#5c7896");
    }
  } else {
    fill(15, 15, w - 30, 49, 8, "#284359");
    for (let i = 0; i < 3; i++) fill(30 + i * 27, 33, 10, 10, 5, i === 0 ? accent : "#85a0b6");
    fill(124, 34, w * 0.56, 9, 4, "#6f8caa");
    for (let i = 0; i < (portrait ? 7 : 4); i++) {
      const y = 96 + i * 101;
      fill(29, y, w - 58, 76, 9, "#1c344e");
      fill(43, y + 16, 46, 43, 8, i % 2 === 0 ? accent : "#54789e");
      fill(114, y + 20, w * 0.41, 10, 4, "#a8c7e5");
      fill(114, y + 42, w * 0.57, 7, 3, "#50718d");
    }
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function PaintedSurface({ kind, width, height, depth }: { kind: Parameters<typeof paintInterface>[0]; width: number; height: number; depth: number }) {
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    const texture = paintInterface(kind);
    // The canvas is created after mounting and owns its texture for this surface.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMap(texture);
    return () => texture.dispose();
  }, [kind]);
  return map && <Surface map={map} width={width} height={height} depth={depth} glow={0.72} />;
}

function ProductSurface({ index }: { index: number }) {
  const maps = useTexture(productViews.map(({ image }) => image), (textures) => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
    });
  });
  const height = [3.21, 2.39, 2.09][index];
  return (
    <group>
      <mesh position={[0, 0, 0.079]}>
        <planeGeometry args={[1.57, 3.23]} />
        <meshBasicMaterial color="#fff8ef" />
      </mesh>
      <mesh position={[0, (3.23 - height) / 2, 0.087]}>
        <planeGeometry args={[1.52, height]} />
        <meshBasicMaterial map={maps[index]} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Phone({ product, productView, scroll, capture }: { product: boolean; productView: number; scroll: number; capture: boolean }) {
  const screen = useRef<Group>(null);
  const circuits = useRef<Group>(null);
  const inlay = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !screen.current || !circuits.current || !inlay.current) return;
    const spread = product ? 0.21 : 0.94 - scroll * 0.48 + Math.sin(clock.elapsedTime * 0.64) * 0.24;
    for (const [part, distance] of [[screen.current, 2], [circuits.current, 1], [inlay.current, 0.47]] as const) {
      part.position.z = MathUtils.damp(part.position.z, spread * distance, 3, delta);
      part.position.x = MathUtils.damp(part.position.x, spread * distance * 0.12, 3, delta);
    }
  });
  const rim = product ? "#c7a384" : "#97bedc";
  return (
    <group position={[-0.34, 0, -0.62]}>
      <Plate size={[1.84, 3.57, 0.18]} radius={0.145} color={rim} metal={0.84} />
      <Plate size={[1.78, 3.51, 0.128]} radius={0.123} position={[0, 0, -0.035]} color="#112440" metal={0.73} />
      <Plate size={[0.51, 0.68, 0.12]} radius={0.095} color="#253957" position={[-0.52, 1.26, -0.115]} />
      {[[-0.64, 1.40], [-0.64, 1.13], [-0.39, 1.25]].map(([x, y]) => (
        <mesh key={`${x},${y}`} position={[x, y, -0.185]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.105, 0.11, 0.09, 24]} />
          <meshStandardMaterial color="#232d49" metalness={0.7} roughness={0.12} />
        </mesh>
      ))}
      <Plate size={[0.055, 0.47, 0.055]} position={[0.928, 0.61, -0.007]} radius={0.014} color={rim} />
      <Plate size={[0.045, 0.24, 0.054]} position={[-0.926, 0.57, 0]} radius={0.014} color={rim} />
      <Plate size={[0.045, 0.24, 0.054]} position={[-0.926, 0.91, 0]} radius={0.014} color={rim} />
      {!product && <>
        <group ref={inlay} position={[0.057, 0, 0.44]}>
          <Plate size={[1.69, 3.39, 0.07]} radius={0.14} color="#255281" metal={0.75} />
          <Plate size={[1.41, 2.41, 0.055]} position={[0, -0.18, 0.044]} color="#163452" metal={0.53} />
          {Array.from({ length: 8 }, (_, i) => (
            <Plate key={i} size={[1.31, 0.019, 0.018]} position={[0, -1.21 + 0.28 * i, 0.078]} radius={0.008}
              color={i % 3 === 0 ? "#67a8ff" : "#415b83"} />
          ))}
          <Plate size={[0.69, 0.51, 0.06]} position={[0.32, 1.13, 0.074]} color="#b9c7dc" metal={0.77} />
        </group>
        <group ref={circuits} position={[0.12, 0, 0.98]}>
          <Plate size={[1.67, 3.42, 0.048]} radius={0.14} color="#395775" metal={0.83} />
          <Plate size={[1.56, 3.29, 0.06]} radius={0.12} color="#102d4b" position={[0, 0, 0.004]} />
          {[-0.96, -0.42, 0.13, 0.69, 1.15].map((y, i) => (
            <group key={y}>
              <Plate size={[0.82, 0.33, 0.08]} position={[(i % 2 ? 0.17 : -0.17), y, 0.055]} color={i % 2 ? "#335485" : "#7794b2"} />
              <Edge from={[-0.71, y - 0.21, 0.065]} to={[0.71, y - 0.21, 0.065]} color="#83b9ff" radius={0.008} />
            </group>
          ))}
        </group>
      </>}
      <group ref={screen} position={[product ? 0.04 : 0.24, 0, product ? 0.39 : 1.88]}>
        <Plate size={[1.76, 3.49, 0.12]} radius={0.15} color={rim} metal={0.78} />
        <Plate size={[1.69, 3.43, 0.118]} radius={0.14} color={product ? "#191712" : "#0c1b32"} position={[0, 0, 0.014]} />
        {product ? <ProductSurface index={productView} /> : <PaintedSurface kind="mobile" width={1.57} height={3.14} depth={0.075} />}
        <Plate size={[0.43, 0.055, 0.024]} radius={0.02} position={[0, 1.608, 0.086]} color="#0f1726" />
      </group>
    </group>
  );
}

function BrowserPanels({ scroll, capture }: { scroll: number; capture: boolean }) {
  const desktop = useRef<Group>(null);
  const handheld = useRef<Group>(null);
  useFrame((_, delta) => {
    if (capture || !desktop.current || !handheld.current) return;
    desktop.current.position.z = MathUtils.damp(desktop.current.position.z, -0.52 - scroll * 0.56, 4, delta);
    handheld.current.position.x = MathUtils.damp(handheld.current.position.x, 1.17 - scroll * 0.45, 4, delta);
    handheld.current.position.z = MathUtils.damp(handheld.current.position.z, 0.85 + scroll * 0.39, 4, delta);
  });
  return (
    <group>
      <group ref={desktop} position={[-0.54, 0.52, -0.52]} rotation={[0.02, 0.11, -0.045]}>
        <Plate size={[3.44, 2.25, 0.12]} color="#6a7897" />
        <PaintedSurface kind="web" width={3.27} height={2.11} depth={0.068} />
      </group>
      <group position={[-0.7, -0.59, 0.34]} rotation={[-0.04, -0.16, 0.035]}>
        <Plate size={[2.9, 1.91, 0.15]} color="#d6b6bd" />
        <PaintedSurface kind="browser" width={2.74} height={1.77} depth={0.08} />
      </group>
      <group ref={handheld} position={[1.17, -0.52, 0.85]} rotation={[0, -0.36, 0.065]}>
        <Plate size={[0.93, 1.64, 0.12]} color="#7f94ae" />
        <PaintedSurface kind="small" width={0.80} height={1.46} depth={0.065} />
      </group>
    </group>
  );
}

const nodePositions = [[-1.75, -0.4, 0], [-1.1, 0.65, -0.43], [-0.46, 0.13, 0.56], [0.12, 1.23, -0.17], [0.62, 0.4, 0.68], [1.46, 1.32, -0.18], [1.75, 0.09, -0.48]] as const;

function Audience({ scroll, capture }: { scroll: number; capture: boolean }) {
  const bars = [0.43, 0.64, 0.55, 0.89, 1.21, 0.96, 1.51, 1.24, 1.74];
  const series = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !series.current) return;
    series.current.children.forEach((bar, index) => {
      const target = 1 - scroll * 0.2 + Math.sin(clock.elapsedTime * 1.1 + index * 0.45) * 0.08;
      bar.scale.y = MathUtils.damp(bar.scale.y, target, 4, delta);
    });
  });
  return (
    <group>
      <Plate size={[3.55, 0.12, 1.72]} position={[0, -1.13, 0]} color="#343149" />
      <group ref={series}>{bars.map((height, i) => (
        <group key={i} position={[-1.39 + i * 0.345, -1.03, 0.3]}>
          <Plate size={[0.21, height, 0.47]} radius={0.042} position={[0, height / 2, 0]} color={i % 3 === 0 ? "#d8889c" : "#6c3148"} metal={0.69} />
          <Plate size={[0.2, 0.057, 0.46]} radius={0.025} position={[0, height, 0.006]} color="#ff5579" metal={0.36} />
        </group>
      ))}</group>
      {nodePositions.slice(1).map((position, i) => (
        <Edge key={i} from={[...nodePositions[i]]} to={[...position]} color="#fd9ca7" radius={0.015} />
      ))}
      {nodePositions.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[i === 3 || i === 5 ? 0.122 : 0.075, 16, 12]} />
          <meshStandardMaterial color="#ffc2cc" metalness={0.43} roughness={0.22} emissive="#ff254c" emissiveIntensity={0.44} />
        </mesh>
      ))}
      <group position={[-1.01, 1.43, 0.12]} rotation={[0, -0.26, 0.15]}>
        <Plate size={[1.45, 0.33, 0.09]} radius={0.14} color="#b27b94" />
        <mesh position={[-0.47, 0, 0.054]}>
          <torusGeometry args={[0.075, 0.01, 8, 20]} />
          <meshStandardMaterial color="#ffe0e8" />
        </mesh>
        <Edge from={[-0.41, -0.055, 0.054]} to={[-0.36, -0.105, 0.054]} color="#ffe0e8" />
        <Plate size={[0.76, 0.035, 0.016]} radius={0.01} position={[0.13, 0, 0.052]} color="#f1c6d9" />
      </group>
    </group>
  );
}

function Modules({ scroll, capture }: { scroll: number; capture: boolean }) {
  const modules = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !modules.current) return;
    modules.current.children.forEach((child, i) => {
      const offset = i % 2 ? 1 : -1;
      child.position.y = MathUtils.damp(child.position.y, Number(child.userData.y) + offset * (0.11 * Math.sin(clock.elapsedTime + i * 0.4) + scroll * 0.28), 4, delta);
    });
  });
  const pieces = [[-1.12, -0.71, 0.34], [-0.1, -0.52, 0.64], [0.91, -0.42, 0.11], [-0.78, 0.48, -0.14], [0.22, 0.73, 0.08], [1.26, 0.75, -0.36], [-0.28, 1.31, -0.57], [0.57, -1.0, -0.69]];
  return (
    <group ref={modules}>
      {pieces.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} userData={{ y }} rotation={[0.08, i % 2 * 0.21, -0.06]}>
          <Plate size={[0.81, 0.65, 0.68]} radius={0.06} color={i % 3 === 0 ? "#a9c3df" : "#294e85"} metal={0.75} />
          <Plate size={[0.65, 0.49, 0.031]} position={[0, 0, 0.351]} color="#0e2446" />
          {[-0.192, -0.064, 0.064, 0.192].map((stripe) => (
            <Plate key={stripe} size={[0.48, 0.018, 0.017]} position={[0, stripe, 0.378]} color={i % 3 === 0 ? "#b8d8ff" : "#526f9d"} />
          ))}
        </group>
      ))}
    </group>
  );
}

function BrandSculpture({ capture }: { capture: boolean }) {
  const mark = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !mark.current) return;
    mark.current.children.forEach((child, i) => {
      child.position.z = MathUtils.damp(child.position.z, i * 0.13 + Math.sin(clock.elapsedTime * 0.7 + i * 0.52) * 0.12, 4, delta);
    });
  });
  return (
    <group ref={mark} rotation={[0.14, -0.15, 0.12]}>
      {[-1.05, -0.16, 0.73].map((x, i) => (
        <group key={x} position={[x, 0, i * 0.13]}>
          <Plate size={[0.4, 1.36, 0.52]} position={[0.15, 0.53, 0]} rotation={[0, 0, 0.58]} color={i === 1 ? "#f34f71" : "#9a294d"} radius={0.06} metal={0.77} />
          <Plate size={[0.4, 1.36, 0.52]} position={[0.15, -0.53, 0]} rotation={[0, 0, -0.58]} color={i === 1 ? "#c93157" : "#622647"} radius={0.06} metal={0.74} />
        </group>
      ))}
    </group>
  );
}

const poses: Record<SceneId, { rotation: [number, number, number]; position: [number, number, number] }> = {
  mobile: { rotation: [0.03, 0.64, -0.26], position: [0, 0, 0] },
  web: { rotation: [0.09, -0.23, -0.075], position: [0.18, 0.04, 0] },
  marketing: { rotation: [0.15, -0.39, -0.05], position: [0, -0.02, 0] },
  technology: { rotation: [0.14, -0.36, -0.14], position: [0.02, 0, 0] },
  product: { rotation: [-0.08, 0.34, -0.17], position: [0.24, 0, 0] },
  brand: { rotation: [0.13, -0.44, -0.1], position: [-0.13, -0.04, 0] },
};

function Stage({ id, scroll, productView, capture, onReady }: {
  id: SceneId; scroll: number; productView: number; capture: boolean; onReady: (id: SceneId) => void;
}) {
  const model = useRef<Group>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const pose = poses[id];
  useEffect(() => {
    if (capture || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      pointer.current = { x: event.clientX / innerWidth * 2 - 1, y: event.clientY / innerHeight * 2 - 1 };
    };
    const reset = () => { pointer.current = { x: 0, y: 0 }; };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [capture]);
  useFrame(({ clock, camera }, delta) => {
    if (!model.current) return;
    frame.current++;
    if (frame.current === 5) onReady(id);
    if (capture) return;
    const time = clock.elapsedTime;
    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, pose.rotation[0] + pointer.current.y * 0.12, 3, delta);
    model.current.rotation.y = MathUtils.damp(model.current.rotation.y, pose.rotation[1] + pointer.current.x * 0.20 - scroll * 0.42, 3, delta);
    model.current.position.y = MathUtils.damp(model.current.position.y, pose.position[1] + Math.sin(time * 0.75) * 0.115 - scroll * 0.11, 3, delta);
    camera.position.x = MathUtils.damp(camera.position.x, (pointer.current.x * 0.1), 2, delta);
  });
  const scale = Math.min(1, size.width / Math.max(size.height, 1));
  return (
    <group ref={model} position={pose.position} rotation={pose.rotation} scale={scale}>
      {(id === "mobile" || id === "product") && <Phone product={id === "product"} productView={productView} scroll={scroll} capture={capture} />}
      {id === "web" && <BrowserPanels scroll={scroll} capture={capture} />}
      {id === "marketing" && <Audience scroll={scroll} capture={capture} />}
      {id === "technology" && <Modules scroll={scroll} capture={capture} />}
      {id === "brand" && <BrandSculpture capture={capture} />}
    </group>
  );
}

class CanvasBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function SoftwareFrames({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => invalidate(), 1000 / 24);
    return () => window.clearInterval(timer);
  }, [active, invalidate]);
  return null;
}

export default function SceneCanvas({ id, paused, scroll, productView, capture, onReady, onFailure }: {
  id: SceneId; paused: boolean; scroll: number; productView: number; capture: boolean;
  onReady: (id: SceneId) => void; onFailure: () => void;
}) {
  const settings = scenes.find((scene) => scene.id === id)!;
  const [software, setSoftware] = useState(false);
  const compact = typeof window !== "undefined" && window.innerWidth < 800;
  return (
    <CanvasBoundary onFailure={onFailure}>
      <Canvas
        dpr={capture ? 1 : software ? 0.8 : [1, compact ? 1.15 : 1.55]}
        camera={{ position: [0, 0, 8.9], fov: 34, near: 0.1, far: 45 }}
        gl={{ alpha: true, antialias: !compact, powerPreference: "low-power" }}
        frameloop={paused || software ? "demand" : "always"}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#000000"), 0);
          const context = gl.getContext();
          const debug = context.getExtension("WEBGL_debug_renderer_info");
          if (!capture && debug && /swiftshader|llvmpipe|software rasterizer/i.test(context.getParameter(debug.UNMASKED_RENDERER_WEBGL))) {
            setSoftware(true);
          }
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFailure();
          }, { once: true });
        }}
      >
        <SoftwareFrames active={software && !paused} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[-3, 5, 5]} color="#d8ecff" intensity={2.1} />
        <directionalLight position={[4, 3, -3]} color={settings.light} intensity={5.0} />
        <directionalLight position={[1, -4, 1]} color={settings.accent} intensity={1.1} />
        <Suspense fallback={null}>
          <Environment resolution={compact ? 64 : 96} frames={1}>
            <Lightformer intensity={2.7} position={[-3, 4, 2]} rotation={[0, Math.PI / 4, 0]} scale={[3, 6, 1]} />
            <Lightformer intensity={1.7} position={[3, -1, 3]} rotation={[0, -Math.PI / 3, 0]} scale={[1.4, 6, 1]} color="#c0dcff" />
            <Lightformer intensity={1.9} position={[1, 3, -4]} rotation={[0, Math.PI, 0]} scale={[5, 2, 1]} color={settings.light} />
          </Environment>
          <Stage key={id} id={id} scroll={scroll} productView={productView} capture={capture} onReady={onReady} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}
