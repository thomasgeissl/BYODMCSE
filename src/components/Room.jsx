import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { el } from "@elemaudio/core";
import configGeneral from "../assets/config.json";
import configTaxi from "../assets/config.taxi.json";
import configFrog from "../assets/config.frog.json";
import useStore from "../store/store";
// import { WaveMaterial } from "./WaveMaterial.js";
import { extractBaseFrequenciesEnergy, map } from "../audio/utils";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

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

let baseEnergy = 0;
let midEnergy = 0;
let highEnergy = 0;

const CustomGeometryParticles = (props) => {
  // https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/
  const { count } = props;

  // This reference gives us direct access to our points
  const points = useRef();

  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const distance = map(midEnergy, 0, 4, 1, 3, true);

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
  const roomId = useParams().roomId ?? "taxi";
  const [playing, setPlaying] = useState(false);
  const { orchestra, core } = props;
  const topic = `byod/${roomId}`;

  const uuid = useStore((state) => state.uuid);

  useEffect(() => {
    core.on("fft", function (e) {
      const baseFrequencyRange = [20, 200]; // Example base frequency range in Hz
      const midFrequencyRange = [201, 4000]; // Example base frequency range in Hz
      const highFrequencyRange = [4001, 10000]; // Example base frequency range in Hz
      baseEnergy = extractBaseFrequenciesEnergy(
        e.data.real,
        44100,
        baseFrequencyRange
      );
      midEnergy = extractBaseFrequenciesEnergy(
        e.data.real,
        44100,
        midFrequencyRange
      );
      highEnergy = extractBaseFrequenciesEnergy(
        e.data.real,
        44100,
        highFrequencyRange
      );
    });
  }, [core]);

  useEffect(
    () => {
      // TODO: get from cms
      let config = configGeneral;
      switch (roomId) {
        case "taxi": {
          config = configTaxi;
          break;
        }
        case "frog": {
          config = configTaxi;
          break;
        }
      }
      mqttClient = mqtt.connect(config.connection.broker);
      mqttClient.on("connect", function () {
        mqttClient.subscribe(topic, function (err) {
          if (err) {
            console.error(err);
          }
        });
        mqttClient.subscribe(`${topic}/user`, function (err) {
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
              // TODO: reset timeout
              if (!playing) {
                setPlaying(true);
                // TODO: set timeout to stop playing
              }
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
            case `${sessionPrefix}byod/${roomId}/user`: {
              const note = 60;
              orchestra?.noteOn("lobby", note, 100);
              setTimeout(() => {
                if (orchestra) {
                  orchestra?.noteOff("lobby", note);
                  const mainOut = orchestra?.render();
                  core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
                }
              }, 300);
              break;
            }
          }
        } catch (error) {
          console.log("error", error);
        }
        if (orchestra) {
          const mainOut = orchestra?.render();
          core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
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
      <StyledCanvas
        onClick={() => {
          if (!playing) {
            const message = { uuid };
            mqttClient.publish(
              `${sessionPrefix}byod/${roomId}/user`,
              JSON.stringify(message)
            );
          }
        }}
      >
        <CustomGeometryParticles count={2000} />
        <ambientLight intensity={0.5} />
        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </StyledCanvas>
    </Container>
  );
}

export default Room;
