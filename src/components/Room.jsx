import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { el } from "@elemaudio/core";
import config from "../assets/config.json";
import configTaxi from "../assets/config.taxi.json";
// import { WaveMaterial } from "./WaveMaterial.js";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
`;

const sessionPrefix = "";
let mqttClient;

// function ShaderPlane() {
//   const ref = useRef();
//   const { width, height } = useThree((state) => state.viewport);
//   useFrame((state, delta) => (ref.current.time += delta));
//   return (
//     <mesh scale={[width, height, 1]}>
//       <planeGeometry />
//       <waveMaterial
//         ref={ref}
//         key={WaveMaterial.key}
//         toneMapped={true}
//         colorStart={"#505050"}
//         colorEnd={"black"}
//       />
//     </mesh>
//   );
// }
const CustomGeometryParticles = (props) => {
  const { count } = props;

  // This reference gives us direct access to our points
  const points = useRef();

  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const distance = 2;

    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      let x = distance * Math.sin(theta) * Math.cos(phi);
      let y = distance * Math.sin(theta) * Math.sin(phi);
      let z = distance * Math.cos(theta);

      positions.set([x, y, z], i * 3);
    }

    return positions;
  }, [count]);

  useFrame((state) => {
    const { clock } = state;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      points.current.geometry.attributes.position.array[i3] +=
        Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
      points.current.geometry.attributes.position.array[i3 + 1] +=
        Math.cos(clock.elapsedTime + Math.random() * 10) * 0.01;
      points.current.geometry.attributes.position.array[i3 + 2] +=
        Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#5786F5"
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

function Room(props) {
  const { roomId } = useParams();
  const { orchestra, core } = props;
  const topic = `byod/${roomId}`;
  console.log("room.render");

  useEffect(
    () => {
      mqttClient = mqtt.connect(config.connection.broker);
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
          el.fft({ name: "mainFft" }, mainOut);
          core?.render(mainOut, mainOut);
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
      <StyledCanvas>
        {/* <ShaderPlane /> */}
        <CustomGeometryParticles count={2000} />

        <ambientLight intensity={0.5} />
      </StyledCanvas>
    </Container>
  );
}

export default Room;
