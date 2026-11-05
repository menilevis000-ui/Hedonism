import React from "react";
import { Composition } from "remotion";
import { Teaser } from "./Teaser";
import { FPS, H, TOTAL, W } from "./theme";
import { PlayTeaser } from "./play/PlayTeaser";
import { PH, PLAY_TOTAL, PW } from "./play/brand";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main: vertical Instagram-story teaser for HEDONISM play */}
      <Composition
        id="HedonismPlayTeaser"
        component={PlayTeaser}
        durationInFrames={PLAY_TOTAL}
        fps={FPS}
        width={PW}
        height={PH}
      />
      {/* First draft: generic landscape teaser */}
      <Composition
        id="HedonismTeaser"
        component={Teaser}
        durationInFrames={TOTAL}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
