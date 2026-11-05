import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { Atmosphere, FilmFinish, Flare } from "./hp/Atmosphere";
import { SceneComingSoon, SceneIntro, SceneLogo, SceneTagline } from "./hp/Scenes";

export const FPS = 30;
export const DURATION = 435; // 14.5 s

export const HedonismPlayStory: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Atmosphere />
      <Sequence durationInFrames={112} name="Intro">
        <SceneIntro />
      </Sequence>
      <Sequence from={96} durationInFrames={146} name="Logo reveal">
        <SceneLogo />
      </Sequence>
      <Sequence from={226} durationInFrames={120} name="Tagline">
        <SceneTagline />
      </Sequence>
      <Sequence from={330} name="Coming soon">
        <SceneComingSoon />
      </Sequence>
      <Flare at={33} strength={0.8} />
      <Flare at={140} y={1010} strength={0.55} />
      <Flare at={226} strength={0.7} />
      <Flare at={330} strength={1} />
      <FilmFinish />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="HedonismPlayStory"
      component={HedonismPlayStory}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
