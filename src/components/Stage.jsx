import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import * as mqtt from "mqtt/dist/mqtt.min";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { el } from "@elemaudio/core";
import { WebMidi } from "webmidi";

import config from "../assets/config.json";
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
import Particles from "./3d/Particles";
import { quarternary, tertiary } from "../theme";
import Spheres from "./3d/Spheres";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
const Overlay = styled.div`
  position: absolute;
  font-size: 24px;
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

function Stage(props) {
  const roomId = useParams().roomId ?? "taxi";
  const [playing, setPlaying] = useState(false);
  const { orchestra, mappings, core } = props;
  const topic = `byod/${roomId}`;

  const uuid = useStore((state) => state.uuid);
  const users = useStore((state) => state.user);
  const addUser = useStore((state) => state.addUser);
  const removeUser = useStore((state) => state.removeUser);

  useEffect(() => {
    WebMidi.enable()
      .then(() => {
        console.log("WebMidi enabled!");
        onEnabled();
      })
      .catch((err) => alert(err));

    function onEnabled() {
      // Inputs
      WebMidi.inputs.forEach((input) => {
        console.log(input.name);
        input.channels.forEach((channel, index) => {
          clearTimeout(playingTimeoutId);
          if (!playing) {
            setPlaying(true);
            playingTimeoutId = setTimeout(() => {
              setPlaying(false);
            }, 3 * 60 * 1000);
          }
          channel.addListener("noteon", (e) => {
            orchestra.noteOn(channel.number, e.note.number, e.data[2]);
            if (orchestra) {
              const mainOut = orchestra?.render();
              core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
            }
          });
          channel.addListener("noteoff", (e) => {
            orchestra.noteOff(channel.number, e.note.number);
            if (orchestra) {
              const mainOut = orchestra?.render();
              core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
            }
          });
          channel.addListener("controlchange", (e) => {
            const control = e.controller.number;
            const value = e.value;
            const destination = mappings[control];
            if (destination) {
              // TODO: get device from orchestra, get parameter from device and map value and finally set
              const matchedDevices = Object.values(orchestra.channels).filter(
                (channel) => channel?.instrument?.id === destination.device
              );
              matchedDevices.forEach((device) => {
                if (device.instrument.setParameter) {
                  device.instrument.setParameter(destination.parameter, value);
                }
              });
              // console.log(destination.device, destination.parameter);
            }
            if (orchestra) {
              const mainOut = orchestra?.render();
              core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
            }
          });
        });
      });

      // Outputs
      WebMidi.outputs.forEach((output) => console.log(output.name));
    }
    return () => {
      console.log("TODO: remove all midi listeners");
    };
  }, [orchestra, setPlaying]);

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
        mqttClient.subscribe(`${topic}/joined`, function (err) {
          if (err) {
            console.error(err);
            return;
          }
          mqttClient.publish(`${topic}/joined`, JSON.stringify({ uuid }));
        });
        mqttClient.subscribe(`${topic}/left`, function (err) {
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
                playingTimeoutId = setTimeout(() => {
                  setPlaying(false);
                }, 3 * 60 * 1000);
              }
              if (payload.status === 176) {
                //CC
                const { channel, control, value } = payload;
                const destination = mappings[control];
                if (destination) {
                  // TODO: get device from orchestra, get parameter from device and map value and finally set
                  // console.log(destination.device, destination.parameter);
                }
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
            case `${sessionPrefix}byod/${roomId}/joined`: {
              addUser(payload.uuid);
              break;
            }
            case `${sessionPrefix}byod/${roomId}/left`: {
              removeUser(payload.uuid);
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
    [],
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
      {!playing && (
        <Overlay>
          tap on the screen to trigger sounds.<br></br>if it does not work,
          refresh and pray - sorry, it is an early stage prototype.
        </Overlay>
      )}
      <StyledCanvas>
        {playing && (
          <Particles
            count={2000}
            core={core}
            color={playing ? quarternary : tertiary}
          />
        )}
        {!playing && <Spheres />}
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

export default Stage;
