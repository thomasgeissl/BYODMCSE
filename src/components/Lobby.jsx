import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import WebRenderer from "@elemaudio/web-renderer";
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";
import Room from "./Room";

const config = {
  orchestra: {
    1: "synth",
    2: "tape_noise",
    3: "sampler",
  },
  files: {
    "/samples/number_0.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/0.mp3",
    "/samples/number_1.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/1.mp3",
    "/samples/number_2.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/2.mp3",
    "/samples/number_3.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/3.mp3",
    "/samples/number_4.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/4.mp3",
    "/samples/number_5.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/5.mp3",
    "/samples/number_6.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/6.mp3",
    "/samples/number_7.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/7.mp3",
    "/samples/number_8.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/8.mp3",
    "/samples/number_9.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/9.mp3",
    "/samples/number_10.wav":
      "https://ia800407.us.archive.org/9/items/999WavFiles/10.mp3",
  },
};

let core = new WebRenderer();

const loadSample = async (path, ctx) => {
  const res = await fetch(path);
  const sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
  return sampleBuffer.getChannelData(0);
};

const Container = styled.div``;

const sessionPrefix = "";
let mqttClient;

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
    console.log("lobby init")
    let node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    console.log("lobby init")

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
