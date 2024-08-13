import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Canvas } from "@react-three/fiber";
import { el } from "@elemaudio/core";
import { WebMidi } from "webmidi";

import { extractBaseFrequenciesEnergy, map } from "../audio/utils";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import Particles from "./3d/Particles";
import { tertiary } from "../theme";
import useLiveSetStore, { core } from "../store/liveSet";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
`;

let baseEnergy = 0;
let midEnergy = 0;
let highEnergy = 0;

function Stage() {
  const engine = useLiveSetStore((state) => state.engine);
  const render = useLiveSetStore((state) => state.render);
  const subscribeToMqtt = useLiveSetStore((state) => state.subscribeToMqtt);
  const roomId = useParams().roomId ?? "demo";

  useEffect(() => {
    subscribeToMqtt(roomId);
  }, [roomId, subscribeToMqtt]);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      WebMidi.enable()
        .then(() => {
          console.log("WebMidi enabled!");
          onEnabled();
        })
        .catch((err) => alert(err));
    }

    function onEnabled() {
      // Inputs
      WebMidi.inputs.forEach((input) => {
        console.log(input.name);
        input.channels.forEach((channel, index) => {
          channel.addListener("noteon", (e) => {
            engine.noteOn(channel.number, e.note.number, e.data[2]);
            if (engine) {
              render();
            }
          });
          channel.addListener("noteoff", (e) => {
            engine.noteOff(channel.number, e.note.number);
            if (engine) {
              const mainOut = engine?.render();
              core?.render(el.fft({ size: 1024 }, mainOut), mainOut);
            }
          });
          channel.addListener("controlchange", (e) => {
            const control = e.controller.number;
            const value = e.value;
            const destination = mappings[control];
            if (destination) {
              const matchedInstruments = [
                ...Object.values(engine.channels).filter(
                  (channel) => channel?.instrument?.id === destination.device
                ),
              ].map((channel) => channel.instrument);
              let effects = [];
              Object.values(engine.channels).forEach((channel) => {
                effects = effects.concat(channel.effects);
              });
              const matchedEffects = effects.filter(
                (effect) => effect.id === destination.device
              );

              [...matchedInstruments, ...matchedEffects].forEach((device) => {
                if (device.setParameter) {
                  device.setParameter(
                    destination.parameter,
                    map(value, 0, 1, destination.min, destination.max)
                  );
                }
              });
            }
            if (engine) {
              render();
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
  }, [engine]);

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

  return (
    <Container>
      <StyledCanvas>
        <Particles count={2000} core={core} color={tertiary} />
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
