import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import WebRenderer from "@elemaudio/web-renderer";
import Orchestra from "../audio/Orchestra";

const ctx = new AudioContext();
let core = new WebRenderer();

const Container = styled.div``;

const sessionPrefix = "";
let mqttClient;

function Room() {
  const { roomId } = useParams();
  // const topic = `rooms/${roomId}/#`;
  const topic = `ofMIDI2MQTT`;
  const [orchestra, setOrchestra] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (ctx.state !== 'running') {
        await ctx.resume();
      }
      let node = await core.initialize(ctx, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
    
      node.connect(ctx.destination);
    };

    init();
  });

  useEffect(() => {
    const config = {
      1: "synth",
      // 2: "sampler",
    };
    setOrchestra(new Orchestra(config));
  }, []);

  useEffect(
    () => {
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
            case "test/noteOn": {
              orchestra?.noteOn(
                payload.channel,
                payload.note,
                payload.velocity
              );
              break;
            }
            case "test/noteOff": {
              orchestra?.noteOff(payload.channel, payload.note);
              break;
            }
          }
        } catch (error) {
          console.log("error", error);
        }
        if (orchestra) {
          const mainOut = orchestra?.render();
          core.render(mainOut, mainOut);
        }
      });
      console.log("subscribe to topic", topic);
    },
    [],
    () => {
      mqttClient.unsubscribe(topic);
    }
  );
  return <Container>room {roomId}</Container>;
}

export default Room;
