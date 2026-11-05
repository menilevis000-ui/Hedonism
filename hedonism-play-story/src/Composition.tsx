import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { Atmosphere, FilmFinish } from "./brand/Atmosphere";
import {
  SceneComingSoon, SceneGroup, ScenePlay, SceneReady, SceneTagline, TileWipe,
} from "./brand/Scenes";

export const FPS = 30;
export const DURATION = 450; // 15 s

export const HedonismPlayStory: React.FC = () => (
  <AbsoluteFill>
    <Atmosphere />
    <Sequence durationInFrames={115} name="HEDONISM group">
      <SceneGroup />
    </Sequence>
    <Sequence from={104} durationInFrames={82} name="Get ready to play">
      <SceneReady />
    </Sequence>
    <Sequence from={162} durationInFrames={50} name="Wipe">
      <TileWipe />
    </Sequence>
    <Sequence from={180} durationInFrames={120} name="HEDONISM play logo">
      <ScenePlay />
    </Sequence>
    <Sequence from={290} durationInFrames={96} name="Tagline">
      <SceneTagline />
    </Sequence>
    <Sequence from={372} name="Coming soon">
      <SceneComingSoon />
    </Sequence>
    <FilmFinish />
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Composition id="HedonismPlayStory" component={HedonismPlayStory} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
