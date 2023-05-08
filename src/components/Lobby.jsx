import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import WebRenderer from "@elemaudio/web-renderer";
import NoSleep from 'nosleep.js'; 
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";
import Room from "./Room";

import config from "../assets/config.json"

let core = new WebRenderer();
var noSleep = new NoSleep();

const loadSample = async (path, ctx) => {
  const res = await fetch(path);
  const sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
  return sampleBuffer.getChannelData(0);
};

const Container = styled.div``;

function Lobby() {
  const { roomId } = useParams();
  // const topic = `rooms/${roomId}/#`;
  const topic = `ofMIDI2MQTT`;
  const [inited, setInited] = useState(false);
  const [orchestra, setOrchestra] = useState(null);
  const init = async () => {
    const ctx = new AudioContext();
    // if (ctx.state !== "running") {
    //   await ctx.resume();
    // }
    let node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    node.connect(ctx.destination);
    core.on("load", async function () {
      const files = {};
      const entries = Object.entries(config.files);
      for (let i = 0; i < entries.length; i++) {
        const [key, path] = entries[i];
        files[key] = await loadSample(path, ctx);
      }

      core.updateVirtualFileSystem(files);
      const orchestra = new Orchestra(config.orchestra);
      setOrchestra(orchestra);
      setInited(true);
    });
    noSleep.enable();
  };

  return (
    <Container>
      {/* room {roomId} */}
      {!inited && (
        <>
          lobby
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
