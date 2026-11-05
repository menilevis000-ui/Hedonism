import React from "react";
import { AbsoluteFill, Html5Audio, Series, staticFile } from "remotion";
import { B, PLAY_SCENES } from "./brand";
import { Grain, Scanlines, Vignette } from "../fx";
import { Assemble } from "./Assemble";
import { Ready } from "./Ready";
import { Decrypt } from "./Decrypt";
import { Finale } from "./Finale";

export const PlayTeaser: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: B.bg }}>
    <Series>
      <Series.Sequence durationInFrames={PLAY_SCENES.assemble} name="Group logo">
        <Assemble />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PLAY_SCENES.ready} name="Get ready to play">
        <Ready />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PLAY_SCENES.decrypt} name="Locked play logo">
        <Decrypt />
      </Series.Sequence>
      <Series.Sequence durationInFrames={PLAY_SCENES.finale} name="Coming soon">
        <Finale />
      </Series.Sequence>
    </Series>
    <Grain opacity={0.05} />
    <Scanlines />
    <Vignette />
    <Html5Audio src={staticFile("play-soundtrack.wav")} />
  </AbsoluteFill>
);
