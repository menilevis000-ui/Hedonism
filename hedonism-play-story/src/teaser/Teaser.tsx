import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Post } from "./Post";
import { Board } from "./Board";
import { Dice } from "./Dice";
import { LogoForm } from "./Logo";
import { CameraRig, Dust, Glint, Sparks, cityGlow } from "./Fx";
import { F_PLAY, F_SOON, easeInOut, easeOut, lerp, span } from "./timeline";
import "@fontsource/montserrat/200.css";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";

const W = 1080, H = 1920;

const Lights: React.FC = () => {
  const f = useCurrentFrame();
  const city = cityGlow(f);
  return (
    <>
      <ambientLight intensity={0.06} />
      <spotLight position={[3.5, 11, 5]} angle={0.55} penumbra={0.9} intensity={lerp(85, 40, city)} color="#ffffff" castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 5, -7]} intensity={0.9} color="#cfd8ea" />
      <pointLight position={[-3, 1.4, 3]} intensity={6} distance={10} color="#d9b46a" />
      <pointLight position={[0, 3, 0]} intensity={12 * city} distance={14} color="#ffd7a0" />
      <Glint />
    </>
  );
};

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const play = easeOut(span(f, F_PLAY, 26));
  const brand = easeOut(span(f, F_PLAY - 4, 26));
  const soon = easeInOut(span(f, F_SOON, 22));
  const sweep = span(f, F_PLAY + 6, 40);
  const silver: React.CSSProperties = {
    backgroundImage: "linear-gradient(100deg, #8d9097 0%, #e9ebee 35%, #ffffff 48%, #dfe2e6 60%, #8d9097 100%)",
    backgroundSize: "300% 100%",
    backgroundPosition: `${lerp(100, 0, sweep)}% 50%`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: "'Montserrat', sans-serif", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 1085, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontWeight: 400, fontSize: 38, letterSpacing: "0.85em", paddingLeft: "0.85em", color: "#e0c27f", opacity: brand, transform: `translateY(${lerp(14, 0, brand)}px)`, filter: `blur(${(1 - brand) * 6}px)` }}>
          HEDONISM
        </div>
        <div style={{ marginTop: 14, fontWeight: 200, fontSize: 168, lineHeight: 1, letterSpacing: `${lerp(0.9, 0.42, play)}em`, paddingLeft: `${lerp(0.9, 0.42, play)}em`, opacity: play, filter: `blur(${(1 - play) * 12}px) drop-shadow(0 0 22px rgba(255,255,255,0.25))`, ...silver }}>
          PLAY
        </div>
        <div style={{ marginTop: 70, display: "flex", alignItems: "center", gap: 26, opacity: soon, transform: `translateY(${lerp(16, 0, soon)}px)` }}>
          <div style={{ width: 90 * soon, height: 1, background: "linear-gradient(90deg, transparent, #cfd3d8)" }} />
          <div style={{ fontWeight: 400, fontSize: 32, letterSpacing: "0.62em", paddingLeft: "0.62em", color: "#e7e9ec" }}>COMING SOON</div>
          <div style={{ width: 90 * soon, height: 1, background: "linear-gradient(270deg, transparent, #cfd3d8)" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HedonismPlayTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = easeInOut(span(f, 0, 8));
  return (
    <AbsoluteFill style={{ backgroundColor: "#030304" }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} dpr={1}>
        <color attach="background" args={["#040405"]} />
        <fog attach="fog" args={["#040405", 11, 30]} />
        <CameraRig />
        <Lights />
        <Environment resolution={512} frames={1}>
          <Lightformer form="rect" intensity={1.6} position={[0, 6, -4]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={1.1} position={[-6, 3, 2]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#ffe2b0" position={[6, 2.5, 3]} rotation-y={-Math.PI / 2} scale={[5, 1, 1]} />
          <Lightformer form="ring" intensity={1} position={[0, 8, 4]} scale={3} />
        </Environment>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <MeshReflectorMaterial blur={[300, 90]} resolution={1024} mixBlur={1} mixStrength={2.2} roughness={0.85} depthScale={1.1}
            minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#0b0b0d" metalness={0.6} mirror={0.6} />
        </mesh>
        <Dice />
        <Board />
        <LogoForm />
        <Dust />
        <Sparks />
        <Post />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
      <Overlay />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - fadeIn }} />
    </AbsoluteFill>
  );
};
