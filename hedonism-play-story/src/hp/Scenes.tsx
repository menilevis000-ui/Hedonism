import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Emblem } from "./Emblem";
import {
  CHAMPAGNE,
  GOLD,
  GOLD_LIGHT,
  SANS,
  SERIF,
  easeIn,
  easeInOut,
  easeOut,
  goldGradient,
  mix,
  prog,
} from "./theme";

const center: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
};

/* ───────────────────────── Scene 1: light birth ───────────────────────── */
export const SceneIntro: React.FC = () => {
  const f = useCurrentFrame();
  const vIn = prog(f, 4, 26, easeInOut);
  const vOut = prog(f, 30, 18, easeIn);
  const h = prog(f, 32, 30, easeOut);
  const hExit = prog(f, 92, 18, easeIn);
  const txtIn = prog(f, 44, 26);
  const txtOut = prog(f, 88, 18, easeIn);
  const spacing = mix(0.25, 0.75, prog(f, 40, 70, easeOut));
  const push = mix(1.0, 1.12, prog(f, 0, 110, easeInOut));
  const ringRot = f * 0.6;
  const ringO = prog(f, 20, 40) * (1 - prog(f, 90, 20));

  return (
    <AbsoluteFill style={{ ...center, perspective: 1400 }}>
      <AbsoluteFill style={{ ...center, transform: `scale(${push})` }}>
        {/* 3D tilted halo rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 760 + i * 220,
              height: 760 + i * 220,
              borderRadius: "50%",
              border: `1px solid rgba(201,163,90,${0.35 - i * 0.09})`,
              transform: `rotateX(${72 - i * 4}deg) rotateZ(${ringRot * (i % 2 ? -1 : 1) + i * 40}deg) scale(${mix(0.6, 1, ringO)})`,
              opacity: ringO,
              boxShadow: "0 0 40px rgba(201,163,90,0.15)",
            }}
          />
        ))}
        {/* vertical beam of light */}
        <div
          style={{
            position: "absolute",
            width: 2,
            height: 900,
            background: `linear-gradient(180deg, transparent, ${CHAMPAGNE}, transparent)`,
            transform: `scaleY(${vIn * (1 - vOut)})`,
            boxShadow: `0 0 18px ${GOLD_LIGHT}`,
          }}
        />
        {/* horizon line */}
        <div
          style={{
            position: "absolute",
            width: mix(0, 820, h) + hExit * 600,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT}, #fff, ${GOLD_LIGHT}, transparent)`,
            boxShadow: `0 0 24px ${GOLD}`,
            opacity: h * (1 - hExit),
          }}
        />
        <div
          style={{
            position: "absolute",
            marginTop: -120,
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 30,
            letterSpacing: `${spacing}em`,
            paddingLeft: `${spacing}em`,
            color: CHAMPAGNE,
            opacity: txtIn * (1 - txtOut),
            filter: `blur(${(1 - txtIn) * 8 + txtOut * 6}px)`,
            transform: `translateY(${-(1 - txtIn) * 20}px)`,
            whiteSpace: "nowrap",
          }}
        >
          HEDONISM
        </div>
        <div
          style={{
            position: "absolute",
            marginTop: 120,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 44,
            letterSpacing: "0.08em",
            ...goldGradient(prog(f, 50, 50)),
            opacity: txtIn * (1 - txtOut),
            filter: `blur(${(1 - txtIn) * 8 + txtOut * 6}px)`,
            transform: `translateY(${(1 - txtIn) * 20}px)`,
          }}
        >
          presents
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ──────────────────────── Scene 2: logo reveal ──────────────────────── */
const Letter3D: React.FC<{
  ch: string;
  i: number;
  n: number;
  start: number;
  sweep: number;
}> = ({ ch, i, n, start, sweep }) => {
  const f = useCurrentFrame();
  const p = prog(f, start + i * 4, 34, easeOut);
  const side = i - (n - 1) / 2;
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateZ(${mix(-700, 0, p)}px) rotateY(${mix(side * 14, 0, p)}deg) translateY(${mix(40, 0, p)}px)`,
        opacity: p,
        filter: `blur(${(1 - p) * 16}px)`,
        ...goldGradient(Math.min(1, Math.max(0, sweep * 1.4 - (i / n) * 0.4))),
      }}
    >
      {ch}
    </span>
  );
};

export const SceneLogo: React.FC = () => {
  const f = useCurrentFrame();
  const word = "HEDONISM".split("");
  const sweep = prog(f, 66, 50, easeInOut);
  const emblemTurn = prog(f, 0, 50, easeOut);
  const playIn = prog(f, 62, 34);
  const playSpacing = mix(1.6, 0.85, prog(f, 58, 60, easeOut));
  const linesIn = prog(f, 72, 30);
  const camY = mix(-14, 8, prog(f, 0, 140, easeInOut));
  const camZ = mix(-260, 0, prog(f, 0, 90, easeOut));
  const exit = prog(f, 116, 26, easeIn);
  const glow = 0.5 + 0.5 * Math.sin(f / 10);

  return (
    <AbsoluteFill style={{ ...center, perspective: 1300 }}>
      <AbsoluteFill
        style={{
          ...center,
          flexDirection: "column",
          transformStyle: "preserve-3d",
          transform: `translateZ(${camZ + exit * 900}px) rotateY(${camY}deg) rotateX(${mix(6, -2, prog(f, 0, 140, easeInOut))}deg)`,
          opacity: 1 - exit,
          filter: `blur(${exit * 14}px)`,
        }}
      >
        {/* emblem with 3D turn-in */}
        <div
          style={{
            transform: `rotateY(${mix(80, 0, emblemTurn)}deg) scale(${mix(0.7, 1, emblemTurn)})`,
            opacity: prog(f, 0, 16),
            marginBottom: 70,
          }}
        >
          <Emblem size={260} start={0} id="a" />
        </div>
        {/* soft back-glow behind wordmark */}
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 300,
            marginTop: 300,
            background: "radial-gradient(ellipse, rgba(201,163,90,0.28), transparent 70%)",
            opacity: prog(f, 40, 40) * (0.7 + glow * 0.3),
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 132,
            letterSpacing: "0.1em",
            paddingLeft: "0.1em",
            lineHeight: 1,
            transformStyle: "preserve-3d",
            whiteSpace: "nowrap",
            filter: `drop-shadow(0 0 ${14 + glow * 10}px rgba(236,200,130,0.35))`,
          }}
        >
          {word.map((ch, i) => (
            <Letter3D key={i} ch={ch} i={i} n={word.length} start={28} sweep={sweep} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
          <div
            style={{
              width: 150 * linesIn,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT})`,
              marginRight: 28,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: 56,
              letterSpacing: `${playSpacing}em`,
              paddingLeft: `${playSpacing}em`,
              color: CHAMPAGNE,
              opacity: playIn,
              filter: `blur(${(1 - playIn) * 10}px)`,
              textShadow: "0 0 24px rgba(255,230,180,0.45)",
            }}
          >
            PLAY
          </div>
          <div
            style={{
              width: 150 * linesIn,
              height: 1,
              background: `linear-gradient(270deg, transparent, ${GOLD_LIGHT})`,
              marginLeft: 28 - 0.85 * 56 * 0.0,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ──────────────────────── Scene 3: tagline ──────────────────────── */
const MaskLine: React.FC<{
  start: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  exit: number;
  exitDir: number;
}> = ({ start, children, style, exit, exitDir }) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 32, easeOut);
  return (
    <div style={{ overflow: "hidden", padding: "0.12em 0.4em", perspective: 800 }}>
      <div
        style={{
          transform: `translateY(${mix(110, 0, p)}%) rotateX(${mix(-50, 0, p)}deg) translateX(${exit * exitDir * 60}px)`,
          opacity: p * (1 - exit),
          filter: `blur(${(1 - p) * 10 + exit * 12}px)`,
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const SceneTagline: React.FC = () => {
  const f = useCurrentFrame();
  const gridIn = prog(f, 0, 30) * (1 - prog(f, 96, 20));
  const push = mix(1.0, 1.1, prog(f, 0, 118, easeInOut));
  const exit = prog(f, 94, 22, easeIn);
  const sweep = prog(f, 40, 60, easeInOut);
  const meetsSpacing = mix(1.2, 0.6, prog(f, 18, 50));
  const lineW = prog(f, 22, 36);

  return (
    <AbsoluteFill style={{ ...center, perspective: 1000, overflow: "hidden" }}>
      {/* futuristic perspective floor grid */}
      <div
        style={{
          position: "absolute",
          top: 1150,
          width: 3200,
          height: 2400,
          backgroundImage:
            "linear-gradient(rgba(201,163,90,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(201,163,90,0.35) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${f * 3}px`,
          transform: "rotateX(78deg)",
          transformOrigin: "50% 0%",
          opacity: gridIn,
          maskImage: "radial-gradient(ellipse 50% 60% at 50% 0%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 60% at 50% 0%, black 0%, transparent 80%)",
        }}
      />
      {/* mirrored ceiling grid */}
      <div
        style={{
          position: "absolute",
          bottom: 1150,
          width: 3200,
          height: 2400,
          backgroundImage:
            "linear-gradient(rgba(201,163,90,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(201,163,90,0.22) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${-f * 3}px`,
          transform: "rotateX(-78deg)",
          transformOrigin: "50% 100%",
          opacity: gridIn * 0.5,
          maskImage: "radial-gradient(ellipse 50% 60% at 50% 100%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 60% at 50% 100%, black 0%, transparent 80%)",
        }}
      />
      {/* orbiting gyroscope rings */}
      <AbsoluteFill style={{ ...center, transformStyle: "preserve-3d", opacity: gridIn }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 860 - i * 90,
              height: 860 - i * 90,
              borderRadius: "50%",
              border: `1px solid rgba(236,215,160,${0.22 - i * 0.05})`,
              transform: `rotateX(${60 + i * 20 + f * 0.4}deg) rotateY(${f * (0.6 + i * 0.3)}deg)`,
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill style={{ ...center, flexDirection: "column", transform: `scale(${push})` }}>
        <MaskLine start={6} exit={exit} exitDir={-1}>
          <span
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: 124,
              color: CHAMPAGNE,
              letterSpacing: "0.02em",
              textShadow: "0 0 30px rgba(255,235,200,0.25)",
            }}
          >
            When design
          </span>
        </MaskLine>
        <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
          <div style={{ width: 120 * lineW, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})`, opacity: 1 - exit }} />
          <MaskLine start={18} exit={exit} exitDir={0}>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 300,
                fontSize: 36,
                letterSpacing: `${meetsSpacing}em`,
                paddingLeft: `${meetsSpacing}em`,
                color: GOLD_LIGHT,
              }}
            >
              MEETS
            </span>
          </MaskLine>
          <div style={{ width: 120 * lineW, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})`, opacity: 1 - exit }} />
        </div>
        <MaskLine start={30} exit={exit} exitDir={1}>
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 150,
              letterSpacing: "0.01em",
              ...goldGradient(sweep),
              filter: "drop-shadow(0 0 22px rgba(236,200,130,0.4))",
            }}
          >
            experiences
          </span>
        </MaskLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ──────────────────────── Scene 4: COMING SOON ──────────────────────── */
const BigWord: React.FC<{ text: string; start: number; sweep: number }> = ({ text, start, sweep }) => {
  const f = useCurrentFrame();
  const chars = text.split("");
  const spacing = mix(0.7, 0.2, prog(f, start, 60, easeOut));
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 200,
        fontSize: 148,
        lineHeight: 1.05,
        letterSpacing: `${spacing}em`,
        paddingLeft: `${spacing}em`,
        whiteSpace: "nowrap",
        transformStyle: "preserve-3d",
      }}
    >
      {chars.map((c, i) => {
        const p = prog(f, start + i * 3, 30, easeOut);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transformOrigin: "50% 100%",
              transform: `rotateX(${mix(-95, 0, p)}deg) translateZ(${mix(-200, 0, p)}px)`,
              opacity: p,
              filter: `blur(${(1 - p) * 12}px)`,
              ...goldGradient(Math.min(1, Math.max(0, sweep * 1.3 - (i / chars.length) * 0.3))),
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

export const SceneComingSoon: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 4, 22], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brandIn = prog(f, 8, 30);
  const lineIn = prog(f, 42, 30, easeInOut);
  const footIn = prog(f, 58, 26);
  const sweep = prog(f, 48, 46, easeInOut);
  const push = mix(1.08, 1.0, prog(f, 0, 50, easeOut)) * mix(1, 1.04, prog(f, 50, 60, easeInOut));
  const tilt = mix(10, 0, prog(f, 0, 70, easeOut));
  const breathe = 0.5 + 0.5 * Math.sin(f / 8);

  return (
    <AbsoluteFill style={{ ...center, perspective: 1200 }}>
      {/* radiant halo */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,163,90,0.22), transparent 62%)",
          opacity: prog(f, 10, 40) * (0.75 + 0.25 * breathe),
          transform: `scale(${mix(0.6, 1, prog(f, 0, 60))})`,
        }}
      />
      {/* rotating fine ring */}
      <div
        style={{
          position: "absolute",
          width: 940,
          height: 940,
          borderRadius: "50%",
          border: "1px dashed rgba(236,215,160,0.18)",
          transform: `rotateX(64deg) rotateZ(${f * 0.5}deg)`,
          opacity: prog(f, 10, 40),
        }}
      />
      <AbsoluteFill
        style={{
          ...center,
          flexDirection: "column",
          transformStyle: "preserve-3d",
          transform: `scale(${push}) rotateX(${tilt}deg)`,
        }}
      >
        <div
          style={{
            opacity: brandIn,
            transform: `translateY(${mix(30, 0, brandIn)}px)`,
            filter: `blur(${(1 - brandIn) * 8}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 90,
          }}
        >
          <Emblem size={130} start={4} id="b" />
          <div
            style={{
              marginTop: 30,
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 40,
              letterSpacing: "0.32em",
              paddingLeft: "0.32em",
              ...goldGradient(prog(f, 20, 50)),
            }}
          >
            HEDONISM PLAY
          </div>
        </div>
        <BigWord text="COMING" start={14} sweep={sweep} />
        <BigWord text="SOON" start={26} sweep={sweep} />
        <div
          style={{
            marginTop: 60,
            width: 640 * lineIn,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT}, #fff, ${GOLD_LIGHT}, transparent)`,
            boxShadow: `0 0 ${16 + breathe * 14}px ${GOLD}`,
          }}
        />
        <div
          style={{
            marginTop: 44,
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 24,
            letterSpacing: "0.5em",
            paddingLeft: "0.5em",
            color: CHAMPAGNE,
            opacity: footIn * 0.8,
            transform: `translateY(${mix(16, 0, footIn)}px)`,
          }}
        >
          A NEW CONCEPT BY HEDONISM
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff8ea", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
