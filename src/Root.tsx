import React from "react";
import { Composition } from "remotion";
import { Teaser } from "./Teaser";
import { FPS, H, TOTAL, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HedonismTeaser"
      component={Teaser}
      durationInFrames={TOTAL}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
