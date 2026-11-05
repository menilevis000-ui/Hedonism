import React from "react";
import { AbsoluteFill, Composition, Folder, Sequence } from "remotion";
import { HedonismPlayTeaser } from "./teaser/Teaser";
import { DURATION as TEASER_DURATION } from "./teaser/timeline";
import {
  SceneCube, SceneFinaleDark, SceneFlood, SceneGroupBurst, SceneKinetic, SceneTaglineTeal,
} from "./brand/Scenes2";
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

/** Version 2 — night edition: brand cube, colour-echo type, teal flood */
export const HedonismPlayStoryNight: React.FC = () => (
  <AbsoluteFill>
    <Atmosphere dark />
    <Sequence durationInFrames={88} name="Brand cube">
      <SceneCube />
    </Sequence>
    <Sequence from={80} durationInFrames={92} name="HEDONISM group">
      <SceneGroupBurst />
    </Sequence>
    <Sequence from={170} durationInFrames={74} name="Get ready to play">
      <SceneKinetic />
    </Sequence>
    <Sequence from={226} durationInFrames={184} name="Teal flood">
      <SceneFlood />
    </Sequence>
    <Sequence from={330} durationInFrames={78} name="Tagline">
      <AbsoluteFill style={{ clipPath: "none" }}>
        <SceneTaglineTeal />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={398} name="Coming soon">
      <SceneFinaleDark />
    </Sequence>
    <FilmFinish />
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Folder name="HEDONISM-PLAY">
    <Composition id="HedonismPlayStory" component={HedonismPlayStory} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="HedonismPlayStoryNight" component={HedonismPlayStoryNight} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="HedonismPlayDiceTeaser" component={HedonismPlayTeaser} durationInFrames={TEASER_DURATION} fps={FPS} width={1080} height={1920} />
  </Folder>
);
