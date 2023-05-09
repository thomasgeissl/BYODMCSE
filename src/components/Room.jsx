import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import WebRenderer from "@elemaudio/web-renderer";
import { el } from "@elemaudio/core";
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";

const Container = styled.div``;

const sessionPrefix = "";
let mqttClient;

function Room(props) {
  const { roomId } = useParams();
  const {orchestra, core} = props
  const topic = `byod/${roomId}`;

  useEffect(
    () => {
      // mqttClient = mqtt.connect("ws://localhost:9001");
      mqttClient = mqtt.connect("wss://public:public@public.cloud.shiftr.io");
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
            case `${sessionPrefix}byod/${roomId}`: {
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
        if (orchestra) {
          const mainOut = orchestra?.render();
          core?.render(mainOut, mainOut);
          // core?.render(el.cycle(440), el.cycle(440))
        }
      });
      console.log("subscribed to topic", topic);
    },
    [orchestra],
    () => {
      mqttClient.unsubscribe(topic);
    }
  );
  return (
    <Container>
room: rf3 visuals here
    </Container>
  );
}

export default Room;
