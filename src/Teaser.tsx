import React from "react";
import { AbsoluteFill, Html5Audio, Series, staticFile } from "remotion";
import { C, SCENES } from "./theme";
import { Grain, Scanlines, Vignette } from "./fx";
import { Boot } from "./scenes/Boot";
import { Warp } from "./scenes/Warp";
import { Hud } from "./scenes/Hud";
import { Logo } from "./scenes/Logo";
import { End } from "./scenes/End";

export const Teaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Series>
        <Series.Sequence durationInFrames={SCENES.boot} name="Boot">
          <Boot />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENES.warp} name="Warp">
          <Warp />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENES.hud} name="HUD">
          <Hud />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENES.logo} name="Logo">
          <Logo />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENES.end} name="End">
          <End />
        </Series.Sequence>
      </Series>
      <Grain />
      <Scanlines />
      <Vignette />
      <Html5Audio src={staticFile("soundtrack.wav")} />
    </AbsoluteFill>
  );
};
