import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import WebRenderer from "@elemaudio/web-renderer";
import { el } from "@elemaudio/core";
import NoSleep from "nosleep.js";
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";
import Room from "./Room";

import config from "../assets/config.json";

const core = new WebRenderer();
const noSleep = new NoSleep();

const loadSample = async (path, ctx) => {
  const res = await fetch(path);
  const sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
  return sampleBuffer.getChannelData(0);
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;
const Instructions = styled.div`
  flex-grow: 1;
  display: flex;
  text-align: center;
  justify-content: center;
  align-content: center;
  flex-direction: column;
`;

function Lobby() {
  const { roomId } = useParams();
  const [inited, setInited] = useState(false);
  const [orchestra, setOrchestra] = useState(null);
  const init = async () => {
    const ctx = new AudioContext();
    // core.on('load', function() {
    //   core.render(el.cycle(440), el.cycle(441));
    // });

    core.on("load", async function () {
      const files = {};
      const entries = Object.entries(config.files);
      for (let i = 0; i < entries.length; i++) {
        const [key, path] = entries[i];
        files[key] = await loadSample(path, ctx);
      }

      core.updateVirtualFileSystem(files);
      // core.render(el.cycle(440), el.cycle(440));
      const orchestra = new Orchestra(config.orchestra);
      setOrchestra(orchestra);
      setInited(true);
    });
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    let node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);
    noSleep.enable();
  };

  return (
    <Container>
      {/* room {roomId} */}
      {!inited && (
        <>
          <Instructions>please turn on your speakers and</Instructions>
          <Button
            onClick={() => {
              init();
            }}
            variant={"outlined"}
          >
            enter
          </Button>
        </>
      )}
      {inited && <Room core={core} orchestra={orchestra}></Room>}
    </Container>
  );
}

export default Lobby;
