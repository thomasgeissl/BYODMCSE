import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import { Canvas, useFrame } from "@react-three/fiber";
import { el } from "@elemaudio/core";

const Container = styled.div``;

const sessionPrefix = "";
let mqttClient;

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (mesh.current.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Room(props) {
  const { roomId } = useParams();
  const { orchestra, core } = props;
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
          console.log(core)
          // core?.render(el.cycle(440), el.cycle(440));
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
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </Canvas>
    </Container>
  );
}

export default Room;
