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
import CustomGeometryParticles from "./3d/Particles";

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



let playingTimeoutId;
function Room(props) {
  const roomId = useParams().roomId ?? "taxi";
  const [playing, setPlaying] = useState(false);
  const { orchestra, core } = props;
  const topic = `byod/${roomId}`;

  const uuid = useStore((state) => state.uuid);

  useEffect(() => {
    core.on("fft", function (e) {
      const baseFrequencyRange = [20, 200];
      const midFrequencyRange = [201, 4000];
      const highFrequencyRange = [4001, 10000];
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
              clearTimeout(playingTimeoutId);
              if (!playing) {
                setPlaying(true);
                setTimeout(() => {
                  setPlaying(false);
                }, 3 * 60 * 1000);
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
              // TODO: get mapping from config file
              // let velocity = map(payload.y, 0, 1, 0, 127, true)
              const velocity = 127;
              const channel =
                payload.y > 0.5 ? "lobbyTextures" : "lobbyNumbers";
              const note =
                60 +
                Math.floor(
                  map(
                    payload.x,
                    0,
                    1,
                    0,
                    channel === "lobbyTextures" ? 6 : 7,
                    true
                  )
                );
              // console.log(channel, note, velocity);
              orchestra?.noteOn(channel, note, velocity);
              setTimeout(() => {
                if (orchestra) {
                  orchestra?.noteOff(channel, note);
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
    },
    [orchestra],
    () => {
      mqttClient.unsubscribe(topic);
    }
  );
  return (
    <Container
      onClick={(event) => {
        if (!playing) {
          const rect = event.target.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const normalizedX = x / rect.width;
          const normalizedY = y / rect.height;
          const message = { uuid, x: normalizedX, y: normalizedY };
          mqttClient.publish(
            `${sessionPrefix}byod/${roomId}/user`,
            JSON.stringify(message)
          );
        }
      }}
    >
      <StyledCanvas>
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
