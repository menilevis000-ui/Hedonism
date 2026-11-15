import React from "react";
import { Composition } from "remotion";
import { Teaser } from "./Teaser";
import { FPS, H, TOTAL, W } from "./theme";
import { PlayTeaser } from "./play/PlayTeaser";
import { PH, PLAY_TOTAL, PW } from "./play/brand";
import { ArrowsAlive } from "./arrows/ArrowsAlive";
import { ARROWS_TOTAL, AH, AW } from "./arrows/data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* The constellation arrows installation, brought to life over real footage */}
      <Composition
        id="ArrowsAlive"
        component={ArrowsAlive}
        durationInFrames={ARROWS_TOTAL}
        fps={FPS}
        width={AW}
        height={AH}
      />
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
