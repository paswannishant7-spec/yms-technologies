"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { CanvasTexture, Color, Group, MathUtils, Quaternion, SRGBColorSpace, Vector3, type Mesh, type MeshBasicMaterial, type Texture } from "three";
import { productScreens, scenes, type SceneId } from "@/content/scenes";

type PlateProps = ThreeElements["group"] & {
  size: [number, number, number];
  radius?: number;
  color?: string;
  metal?: number;
  roughness?: number;
};

function Plate({ size, radius = 0.07, color = "#eef2f6", metal = 0.2, roughness = 0.38, ...position }: PlateProps) {
  return (
    <group {...position}>
      <RoundedBox args={size} radius={radius} smoothness={2}>
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
      <meshStandardMaterial color={color} metalness={0.25} roughness={0.38} />
    </mesh>
  );
}

function Surface({ map, width, height, depth }: { map: Texture; width: number; height: number; depth: number }) {
  return (
    <mesh position={[0, 0, depth]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

function paintInterface(kind: "mobile" | "web" | "browser" | "small") {
  const canvas = document.createElement("canvas");
  const portrait = kind === "mobile" || kind === "small";
  canvas.width = portrait ? 432 : 704;
  canvas.height = portrait ? 864 : 480;
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext("2d")!;
  const blue = "#0866e9";
  const navy = "#0c1d35";
  const ice = "#eaf3fc";
  const gold = "#ffc107";
  const fill = (x: number, y: number, width: number, height: number, radius: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  };
  const label = (text: string, x: number, y: number, size: number, color = navy) => {
    ctx.fillStyle = color;
    ctx.font = "700 " + size + "px system-ui";
    ctx.fillText(text, x, y);
  };
  fill(0, 0, w, h, 24, kind === "mobile" ? "#f7faff" : "#ffffff");
  if (kind === "mobile") {
    fill(22, 32, 388, 320, 26, "#075acc");
    fill(38, 53, 121, 31, 15, "#ffffff23");
    label("FIELD NOTES", 50, 75, 15, "#ffffff");
    label("A space to", 44, 146, 52, "#ffffff");
    label("think clearly.", 44, 206, 52, "#ffffff");
    fill(45, 248, 126, 46, 23, gold);
    label("New note", 62, 277, 17);
    ctx.strokeStyle = "#a8d8ff";
    ctx.lineWidth = 2;
    for (const radius of [38, 53, 68]) {
      ctx.beginPath();
      ctx.arc(339, 259, radius, -2.85, 1.86);
      ctx.stroke();
    }
    label("Your workspace", 25, 417, 30);
    for (const [i, item] of ["Ideas", "In progress", "Saved notes"].entries()) {
      const y = 445 + i * 109;
      fill(22, y, 388, 88, 19, i === 1 ? "#fff4cb" : ice);
      fill(40, y + 18, 50, 50, 15, i === 1 ? "#d79500" : blue);
      fill(53, y + 33, 24, 4, 2, "#ffffff");
      fill(53, y + 43, 18, 4, 2, "#ffffff");
      label(item, 108, y + 43, 22);
      fill(108, y + 58, 140 - i * 17, 5, 2, "#94abc3");
    }
    fill(140, 819, 150, 8, 4, "#becfe2");
  } else {
    fill(0, 0, w, portrait ? 67 : 53, 5, "#dbe9f9");
    for (let i = 0; i < 3; i++) fill(18 + i * 17, 23, 8, 8, 4, i === 0 ? blue : "#7c98b9");
    fill(94, 16, w - 112, 22, 11, "#ffffff");
    const top = portrait ? 92 : 76;
    fill(18, top, w - 36, portrait ? 295 : 235, 15, kind === "web" ? blue : ice);
    label("STUDIO / DEMO", 34, top + 47, 16, kind === "web" ? "#ffffff" : navy);
    label("Form & function", 33, top + 112, portrait ? 37 : 59, kind === "web" ? "#ffffff" : navy);
    fill(34, top + 145, 100, 35, 17, gold);
    label("Explore", 55, top + 168, 15);
    if (!portrait) {
      fill(w - 160, top + 118, 92, 92, 46, kind === "web" ? gold : blue);
      ctx.strokeStyle = kind === "web" ? "#fff5c5" : "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w - 112, top + 167, 30, -1.9, 1.7);
      ctx.stroke();
    }
    const count = portrait ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const x = portrait ? 18 : 18 + i * (w - 36) / 2;
      const y = portrait ? 430 + i * 123 : 331;
      fill(x, y, portrait ? w - 36 : (w - 52) / 2, portrait ? 105 : 124, 13, i === 1 ? "#ffefb7" : "#dcecff");
      fill(x + 15, y + 16, 55, 50, 10, i === 1 ? gold : blue);
      fill(x + 88, y + 28, portrait ? 150 : 113, 10, 4, navy);
      fill(x + 88, y + 49, portrait ? 174 : 147, 6, 3, "#6785a7");
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
  return map && <Surface map={map} width={width} height={height} depth={depth} />;
}

function ProductSurface({ index }: { index: number }) {
  const material = useRef<MeshBasicMaterial>(null);
  const outgoing = useRef<Mesh>(null);
  const outgoingMaterial = useRef<MeshBasicMaterial>(null);
  const previous = useRef(index);
  const maps = useTexture(productScreens.map(({ image }) => image), (textures) => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
    });
  });
  useFrame((_, delta) => {
    if (!material.current || !outgoing.current || !outgoingMaterial.current) return;
    if (previous.current !== index) {
      const old = productScreens[previous.current];
      const width = Math.min(1.52, 3.23 * old.width / old.height);
      const height = width * old.height / old.width;
      outgoing.current.scale.set(width, height, 1);
      outgoing.current.position.y = (3.23 - height) / 2;
      outgoingMaterial.current.map = maps[previous.current];
      outgoing.current.visible = true;
      previous.current = index;
      material.current.opacity = 0;
    }
    material.current.opacity = MathUtils.damp(material.current.opacity, 1, 15, delta);
    if (material.current.opacity > .995) outgoing.current.visible = false;
  });
  const screen = productScreens[index];
  const width = Math.min(1.52, 3.23 * screen.width / screen.height);
  const height = width * screen.height / screen.width;
  return (
    <group>
      <mesh position={[0, 0, 0.079]}>
        <planeGeometry args={[1.57, 3.23]} />
        <meshBasicMaterial color="#fff8ef" />
      </mesh>
      <mesh ref={outgoing} position={[0, 0, .083]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={outgoingMaterial} map={maps[index]} toneMapped={false} />
      </mesh>
      <mesh position={[0, (3.23 - height) / 2, 0.087]} scale={[width, height, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={material} map={maps[index]} toneMapped={false} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function Phone({ product, productView, scroll, capture }: { product: boolean; productView: number; scroll: number; capture: boolean }) {
  const screen = useRef<Group>(null);
  const UI = useRef<Group>(null);
  const backing = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !screen.current || !UI.current || !backing.current) return;
    const spread = .85 - scroll * .52 + Math.sin(clock.elapsedTime * .68) * .13;
    for (const [part, distance] of [[screen.current, 2], [UI.current, 1], [backing.current, .44]] as const) {
      part.position.z = MathUtils.damp(part.position.z, spread * distance, 3.2, delta);
      part.position.x = MathUtils.damp(part.position.x, spread * distance * .15, 3.2, delta);
    }
  });
  const titanium = product ? "#bcaa99" : "#bdc9d2";
  return (
    <group position={[-.28, 0, -.54]}>
      <Plate size={[1.82, 3.55, .16]} radius={.15} color={titanium} metal={.58} />
      <Plate size={[1.74, 3.47, .081]} radius={.13} position={[0, 0, -.063]} color="#f3f5f7" metal={.17} roughness={.39} />
      <Plate size={[.05, .47, .06]} radius={.017} position={[.918, .62, -.006]} color={titanium} metal={.60} />
      {[.6, .91].map((y) => <Plate key={y} size={[.045, .21, .05]} radius={.017} position={[-.915, y, 0]} color={titanium} />)}
      {!product && <>
        <group ref={backing} position={[.055, 0, .374]}>
          <Plate size={[1.73, 3.45, .058]} radius={.132} color="#dae8f1" />
          <Plate size={[1.38, 2.71, .045]} radius={.095} position={[0, -.02, .035]} color="#a8c2de" metal={.33} />
          <Plate size={[.72, .57, .062]} position={[-.24, 1.13, .046]} color="#f3f7fb" metal={.32} />
        </group>
        <group ref={UI} position={[.128, 0, .85]}>
          <Plate size={[1.72, 3.41, .06]} radius={.138} color="#ebf5ff" metal={.32} />
          {[-1.08, -.56, -.04, .48, 1.02].map((y, i) => (
            <group key={y}>
              <Plate size={[1.19, .37, .07]} radius={.075} position={[0, y, .055]} color={i === 4 ? "#1265d1" : i === 2 ? "#f4c44c" : "#ffffff"} />
              <Plate size={[.33, .105, .024]} radius={.033} position={[-.35, y + .03, .104]} color={i === 4 ? "#eaf3fc" : "#a6c4e7"} />
              <Plate size={[.36, .04, .021]} radius={.017} position={[.23, y + .04, .108]} color={i === 4 ? "#ffffff" : "#326bb0"} />
            </group>
          ))}
        </group>
      </>}
      <group ref={screen} position={[product ? .04 : .255, 0, product ? .24 : 1.7]}>
        <Plate size={[1.78, 3.49, .12]} radius={.15} color={titanium} metal={.68} roughness={.33} />
        <Plate size={[1.70, 3.42, .113]} radius={.14} color={product ? "#2a241e" : "#132744"} position={[0, 0, .014]} />
        {product ? <ProductSurface index={productView} /> : <PaintedSurface kind="mobile" width={1.57} height={3.14} depth={.086} />}
        <Plate size={[.29, .037, .024]} radius={.015} position={[0, 1.613, .09]} color="#1d334e" metal={.25} />
      </group>
    </group>
  );
}

function BrowserPanels({ scroll, capture }: { scroll: number; capture: boolean }) {
  const desktop = useRef<Group>(null);
  const tablet = useRef<Group>(null);
  const handheld = useRef<Group>(null);
  useFrame((_, delta) => {
    if (capture || !desktop.current || !tablet.current || !handheld.current) return;
    desktop.current.position.z = MathUtils.damp(desktop.current.position.z, -0.52 - scroll * 0.56, 4, delta);
    desktop.current.scale.setScalar(MathUtils.damp(desktop.current.scale.x, 1 - scroll * .12, 4, delta));
    tablet.current.position.x = MathUtils.damp(tablet.current.position.x, -.7 + scroll * .23, 4, delta);
    tablet.current.rotation.y = MathUtils.damp(tablet.current.rotation.y, -.16 + scroll * .27, 4, delta);
    handheld.current.position.x = MathUtils.damp(handheld.current.position.x, 1.17 - scroll * 0.45, 4, delta);
    handheld.current.position.z = MathUtils.damp(handheld.current.position.z, 0.85 + scroll * 0.39, 4, delta);
  });
  return (
    <group>
      <group ref={desktop} position={[-0.54, 0.52, -0.52]} rotation={[0.02, 0.11, -0.045]}>
        <Plate size={[3.44, 2.25, 0.12]} color="#cbd5e2" metal={.54} />
        <PaintedSurface kind="web" width={3.27} height={2.11} depth={0.068} />
      </group>
      <group ref={tablet} position={[-0.7, -0.59, 0.34]} rotation={[-0.04, -0.16, 0.035]}>
        <Plate size={[2.9, 1.91, 0.15]} color="#e1e7ed" metal={.57} />
        <PaintedSurface kind="browser" width={2.74} height={1.77} depth={0.08} />
      </group>
      <group ref={handheld} position={[1.17, -0.52, 0.85]} rotation={[0, -0.36, 0.065]}>
        <Plate size={[0.93, 1.64, 0.12]} color="#183858" metal={.32} />
        <PaintedSurface kind="small" width={0.80} height={1.46} depth={0.065} />
      </group>
    </group>
  );
}

const nodePositions = [[-1.62, -.51, 0], [-.98, .52, -.42], [-.43, .16, .55], [.12, 1.18, -.13], [.68, .53, .65], [1.54, 1.34, -.16], [1.68, .02, -.4]] as const;

function Audience({ scroll, capture }: { scroll: number; capture: boolean }) {
  const series = useRef<Group>(null);
  const query = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture) return;
    series.current?.children.forEach((bar, index) => {
      const target = .84 + scroll * .26 + Math.sin(clock.elapsedTime * 1.05 + index * .45) * .06;
      bar.scale.y = MathUtils.damp(bar.scale.y, target, 4, delta);
    });
    if (query.current) query.current.position.y = MathUtils.damp(query.current.position.y, 1.5 - scroll * .26, 4, delta);
  });
  return (
    <group>
      <Plate size={[3.71, .18, 1.51]} position={[0, -1.14, 0]} radius={.085} color="#dce9f6" metal={.34} />
      <group ref={series}>
        {[.42, .69, .98, 1.16, .92, 1.45].map((height, i) => (
          <group key={i} position={[-1.32 + i * .52, -1.04, .18]}>
            <Plate size={[.39, height, .51]} radius={.065} position={[0, height / 2, 0]}
              color={i % 3 === 1 ? "#ffc52d" : i % 3 === 2 ? "#76abf7" : "#176cdb"} metal={.18} />
          </group>
        ))}
      </group>
      {nodePositions.slice(1).map((position, i) => (
        <Edge key={i} from={[...nodePositions[i]]} to={[...position]} color="#507ba9" radius={.018} />
      ))}
      {nodePositions.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[i === 3 || i === 5 ? .125 : .079, 16, 12]} />
          <meshStandardMaterial color={i % 2 ? "#ffc107" : "#315fa2"} metalness={.19} roughness={.42} />
        </mesh>
      ))}
      <group ref={query} position={[-.94, 1.5, .08]} rotation={[0, -.25, .12]}>
        <Plate size={[1.67, .38, .12]} radius={.155} color="#f8fbff" metal={.14} />
        <mesh position={[-.54, .019, .064]}>
          <torusGeometry args={[.082, .012, 8, 20]} />
          <meshStandardMaterial color="#1558a7" />
        </mesh>
        <Edge from={[-.48, -.041, .064]} to={[-.41, -.113, .064]} color="#1558a7" />
        <Plate size={[.79, .031, .02]} radius={.01} position={[.16, 0, .067]} color="#7e9ec1" />
      </group>
    </group>
  );
}

const modulesLayout = [
  { x: -1.18, y: -.54, z: .34, color: "#a6c9fa" },
  { x: -.39, y: -.55, z: .34, color: "#1266d9" },
  { x: .4, y: -.55, z: .34, color: "#f3f5f8" },
  { x: .4, y: .08, z: .34, color: "#ffca31" },
  { x: .4, y: .71, z: .34, color: "#1266d9" },
  { x: -.39, y: .71, z: .34, color: "#a6c9fa" },
  { x: -.39, y: 1.34, z: .34, color: "#f3f5f8" },
  { x: 1.19, y: -.55, z: .34, color: "#1266d9" },
];

function Modules({ scroll, capture }: { scroll: number; capture: boolean }) {
  const modules = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (capture || !modules.current) return;
    modules.current.children.forEach((child, i) => {
      const anchor = modulesLayout[i];
      const drift = Math.sin(clock.elapsedTime * .72 + i * .22);
      child.position.z = MathUtils.damp(child.position.z, anchor.z + drift * .09 + scroll * (i % 2 ? .5 : -.3), 4, delta);
      child.position.y = MathUtils.damp(child.position.y, anchor.y + drift * .05, 4, delta);
    });
  });
  return (
    <group position={[.04, -.34, -.04]}>
      <Plate size={[3.55, .18, 1.38]} radius={.09} position={[0, -.99, 0]} color="#dce7f2" metal={.42} />
      <group ref={modules}>
        {modulesLayout.map(({ x, y, z, color }, i) => (
          <group key={i} position={[x, y, z]}>
            <Plate size={[.73, .58, .6]} radius={.11} color={color} roughness={.38} />
            <Plate size={[.4, .042, .03]} radius={.015} position={[0, 0, .308]} color={color === "#1266d9" ? "#b7d6ff" : "#5c7ea3"} />
          </group>
        ))}
      </group>
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
          <Plate size={[0.4, 1.36, 0.52]} position={[0.15, 0.53, 0]} rotation={[0, 0, 0.58]} color={["#e6edf6", "#0866e9", "#ffc107"][i]} radius={.075} metal={.25} roughness={.37} />
          <Plate size={[0.4, 1.36, 0.52]} position={[0.15, -0.53, 0]} rotation={[0, 0, -0.58]} color={["#c2d4e9", "#1456ad", "#ffbe1c"][i]} radius={.075} metal={.25} roughness={.37} />
        </group>
      ))}
    </group>
  );
}

const poses: Record<SceneId, { rotation: [number, number, number]; position: [number, number, number] }> = {
  mobile: { rotation: [0.045, 0.64, -0.23], position: [0, 0, 0] },
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
    if (frame.current === 3) onReady(id);
    if (capture) return;
    const time = clock.elapsedTime;
    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, pose.rotation[0] + pointer.current.y * 0.12, 3, delta);
    const entrance = 1 - Math.min(1, frame.current / 25);
    model.current.rotation.y = MathUtils.damp(model.current.rotation.y, pose.rotation[1] + pointer.current.x * .17 - scroll * .35 + entrance * .085, 3, delta);
    model.current.position.y = MathUtils.damp(model.current.position.y, pose.position[1] + Math.sin(time * 0.75) * 0.115 - scroll * 0.11, 3, delta);
    camera.position.x = MathUtils.damp(camera.position.x, (pointer.current.x * 0.1), 2, delta);
  });
  const scale = Math.min(1, size.width / Math.max(size.height, 1)) * (size.width < 470 ? .97 : 1);
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
    const timer = window.setInterval(() => { if (!document.hidden) invalidate(); }, 1000 / 20);
    return () => window.clearInterval(timer);
  }, [active, invalidate]);
  return null;
}

export default function SceneCanvas({ id, paused, scroll, productView, capture, software, onReady, onFailure }: {
  id: SceneId; paused: boolean; scroll: number; productView: number; capture: boolean; software: boolean;
  onReady: (id: SceneId) => void; onFailure: () => void;
}) {
  const settings = scenes.find((scene) => scene.id === id)!;
  const compact = typeof window !== "undefined" && window.innerWidth < 800;
  return (
    <CanvasBoundary onFailure={onFailure}>
      <Canvas
        dpr={capture ? 1 : software ? 0.64 : [1, compact ? 1.15 : 1.5]}
        camera={{ position: [0, 0, 8.8], fov: 34, near: .1, far: 35 }}
        gl={{ alpha: true, antialias: capture || (!compact && !software), powerPreference: "low-power" }}
        frameloop={paused || software ? "demand" : "always"}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#000000"), 0);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFailure();
          }, { once: true });
        }}
      >
        <SoftwareFrames active={software && !paused} />
        <ambientLight intensity={0.72} />
        <directionalLight position={[-3, 5, 5]} color="#fff9f0" intensity={2.35} />
        <directionalLight position={[4, 3, -3]} color={settings.light} intensity={1.75} />
        <directionalLight position={[1, -4, 1]} color="#e9f5ff" intensity={.74} />
        <Suspense fallback={null}>
          <Environment resolution={software ? 32 : compact ? 48 : 72} frames={1}>
            <Lightformer intensity={2.35} position={[-3, 4, 2]} rotation={[0, Math.PI / 4, 0]} scale={[3, 6, 1]} />
            <Lightformer intensity={1.4} position={[3, -1, 3]} rotation={[0, -Math.PI / 3, 0]} scale={[1.4, 6, 1]} color="#f7faff" />
            <Lightformer intensity={1.45} position={[1, 3, -4]} rotation={[0, Math.PI, 0]} scale={[5, 2, 1]} color={settings.light} />
          </Environment>
          <Stage key={id} id={id} scroll={scroll} productView={productView} capture={capture} onReady={onReady} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}
