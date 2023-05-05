import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import WebRenderer from "@elemaudio/web-renderer";
import { el } from "@elemaudio/core";
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";

const config = {
  orchestra:{
  1: "synth",
  2: "tape_noise",
  3: "sampler",
  },
  files:{
    "/samples/number_0.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/0.mp3",
    "/samples/number_1.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/1.mp3",
    "/samples/number_2.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/2.mp3",
    "/samples/number_3.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/3.mp3",
    "/samples/number_4.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/4.mp3",
    "/samples/number_5.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/5.mp3",
    "/samples/number_6.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/6.mp3",
    "/samples/number_7.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/7.mp3",
    "/samples/number_8.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/8.mp3",
    "/samples/number_9.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/9.mp3",
    "/samples/number_10.wav": "https://ia800407.us.archive.org/9/items/999WavFiles/10.mp3",
  }
};

const ctx = new AudioContext();
let core = new WebRenderer();

const loadSample = async (path) =>{
    const res = await fetch(path)
    const sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
    return sampleBuffer.getChannelData(0);
}

core.on("load", async () => {
  const files = {};
  
  const entries = Object.entries(config.files)
  for(let i = 0; i < entries.length; i++) {
    const [key, path] = entries[i]
    files[key] = await loadSample(path)
  }
  
  core.updateVirtualFileSystem(files);
});

const Container = styled.div``;

const sessionPrefix = "";
let mqttClient;

function Room() {
  const { roomId } = useParams();
  // const topic = `rooms/${roomId}/#`;
  const topic = `ofMIDI2MQTT`;
  const [orchestra, setOrchestra] = useState(null);
  const [inited, setInited] = useState(false);
  const init = async () => {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    let node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    node.connect(ctx.destination);
  };

  useEffect(() => {
    if (!inited) {
      return;
    }
  }, [inited]);

  useEffect(() => {

    const orchestra = new Orchestra(config.orchestra);
    console.log(orchestra);
    setOrchestra(orchestra);
  }, []);

  useEffect(
    () => {
      if (!inited) {
        return;
      }

      mqttClient = mqtt.connect("ws://localhost:9001");
      mqttClient.on("connect", function () {
        mqttClient.subscribe(topic, function (err) {
          if (err) {
            console.error(err);
          }
        });
      });

      // mqttClient.on("message", function (topic, message) {
      //   // message is Buffer
      //   console.log(message.toString());
      // });
      mqttClient.on("message", function (topic, message) {
        // message is Buffer
        try {
          const payload = JSON.parse(message.toString());
          switch (topic) {
            case `${sessionPrefix}ofMIDI2MQTT`: {
              if (payload.status === 144) {
                orchestra?.noteOn(
                  payload.channel,
                  payload.note,
                  payload.velocity
                );
              } else if (payload.status === 128) {
                orchestra?.noteOff(payload.channel, payload.note);
              }
              break;
            }
            // case "test/noteOn": {
            //   orchestra?.noteOn(
            //     payload.channel,
            //     payload.note,
            //     payload.velocity
            //   );
            //   break;
            // }
            // case "test/noteOff": {
            //   orchestra?.noteOff(payload.channel, payload.note);
            //   break;
            // }
          }
        } catch (error) {
          console.log("error", error);
        }
        if (orchestra && inited) {
          const mainOut = orchestra?.render();
          core?.render(mainOut, mainOut);
          // core?.render(el.cycle(440), el.cycle(440))
        }
      });
      console.log("subscribed to topic", topic);
    },
    [orchestra, inited],
    () => {
      mqttClient.unsubscribe(topic);
    }
  );
  return (
    <Container>
      {/* room {roomId} */}
      {!inited && (
        <Button
          onClick={() => {
            init();
            setInited(true);
          }}
          variant={"outlined"}
        >
          start audio context
        </Button>
      )}
    </Container>
  );
}

export default Room;
