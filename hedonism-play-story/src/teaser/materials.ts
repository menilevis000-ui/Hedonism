import * as THREE from "three";
import { random } from "remotion";

export const M = {
  obsidian: new THREE.MeshPhysicalMaterial({ color: "#0a0a0c", roughness: 0.12, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 }),
  pearl: new THREE.MeshPhysicalMaterial({ color: "#f3f1ec", roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4 }),
  silver: new THREE.MeshStandardMaterial({ color: "#d9dce1", roughness: 0.18, metalness: 1 }),
  brushed: new THREE.MeshStandardMaterial({ color: "#9a9ea6", roughness: 0.38, metalness: 1 }),
  gold: new THREE.MeshStandardMaterial({ color: "#d9b56c", roughness: 0.3, metalness: 0.75 }),
  logoSilver: new THREE.MeshPhysicalMaterial({ color: "#c3c7cd", roughness: 0.3, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.15 }),
  logoBlack: new THREE.MeshPhysicalMaterial({ color: "#2a2b30", roughness: 0.25, metalness: 0.3, clearcoat: 1 }),
  goldSoft: new THREE.MeshStandardMaterial({ color: "#c9a865", roughness: 0.45, metalness: 0.9 }),
  satin: new THREE.MeshStandardMaterial({ color: "#b7bbc2", roughness: 0.45, metalness: 1 }),
  ink: new THREE.MeshPhysicalMaterial({ color: "#050506", roughness: 0.3, metalness: 0.1, clearcoat: 0.6 }),
  lacquer: new THREE.MeshPhysicalMaterial({ color: "#0d0d10", roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
  graphite: new THREE.MeshPhysicalMaterial({ color: "#26272b", roughness: 0.3, metalness: 0.5, clearcoat: 0.8 }),
  marble: new THREE.MeshPhysicalMaterial({ color: "#b9b8b4", roughness: 0.28, metalness: 0, clearcoat: 1 }),
};

export const glowMat = (color: string, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });

/** Procedural night-window texture for towers (deterministic) */
export const makeWindowTexture = (seed: string) => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 64, 128);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 8; x++) {
      const r = random(`${seed}-${x}-${y}`);
      if (r < 0.55) continue;
      const warm = r > 0.8;
      g.fillStyle = warm ? `rgba(255,214,150,${0.6 + r * 0.4})` : `rgba(220,228,240,${0.35 + r * 0.4})`;
      g.fillRect(x * 8 + 2, y * 8 + 2, 4, 5);
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
