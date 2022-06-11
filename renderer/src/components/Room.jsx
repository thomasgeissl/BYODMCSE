import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";

const Container = styled.div``;

let mqttClient;

function Room() {
  const { roomId } = useParams();
  const topic = `rooms/${roomId}/#`;

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

      mqttClient.on("message", function (topic, message) {
        // message is Buffer
        console.log(message.toString());
      });
      console.log("subscribe to topic", topic);
    },
    [],
    () => {
          mqttClient.unsubscribe(topic)
    }
  );
  return <Container>room {roomId}</Container>;
}

export default Room;
