import { el } from "@elemaudio/core";
import { Midi } from "tonal";
import { v4 } from "uuid";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS } from "react-dom/client";

// https://www.youtube.com/watch?v=0voWrxLDnSE


class Synth extends Base{
  voices: any[];
  constructor(id: string) {
    super(id)
    this.voices = [
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v1-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v2-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v3-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v4-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v5-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v6-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v7-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v8-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v9-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v10-${v4()}` },
    ];
  }

  nextVoice = 0;

  getWaveform = (waveform: string, frequency: any) => {
  switch (waveform) {
    case "sine":
      return el.cycle(frequency);
    case "saw":
      return el.saw(frequency);
    case "square":
      return el.square(frequency);
    case "triangle":
      return el.triangle(frequency);
    default:
      return el.cycle(frequency);
  }
};
  voice = (voice: any) => {
    const getParameterValue = useLiveSetStore.getState().getParameterValue
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.adsr(1.0, 1.0, 1.0, 2.0, gate);
    const frequency: number = Midi.midiToFreq(voice.note);
    const amplitudeA: number = getParameterValue(this.id, "amplitudeA")
    const detuneA: number = getParameterValue(this.id, "detuneA")
    // Oscillator A
    const oscA = el.mul(
      amplitudeA,
      this.getWaveform(
        getParameterValue(this.id, "waveformA"),
        el.const({
          key: `frequencyA-${voice.key}`,
          value: frequency * detuneA
        })
      )
    );

    // Oscillator B
    const oscB = el.mul(
      getParameterValue(this.id, "amplitudeB"),
      this.getWaveform(
        getParameterValue(this.id, "waveformB"),
        el.const({
          key: `frequencyB-${voice.key}`,
          value: frequency * 
          getParameterValue(this.id, "detuneB")
        })
      )
    );

    // Oscillator C
    const oscC = el.mul(
      getParameterValue(this.id, "amplitudeC"),
      this.getWaveform(
        getParameterValue(this.id, "waveformC"),
        el.const({
          key: `frequencyC-${voice.key}`,
          value: frequency * 
          getParameterValue(this.id, "detuneC")
        })
      )
    );

    const signal = el.add(oscA, oscB, oscC);
    return el.mul(env, signal)//, voice.velocity);
  };

  noteOn(note: number, velocity: number) {
    const voiceIndex = this.voices.findIndex((v) => v.note === note);
    if (voiceIndex >= 0) {
      this.voices[voiceIndex].gate = 1.0;
      this.voices[voiceIndex].note = note;
      this.voices[voiceIndex].velocity = velocity / 127;
    } else {
      this.voices[this.nextVoice].gate = 1.0;
      this.voices[this.nextVoice].note = note;
      this.voices[this.nextVoice].velocity = velocity / 127;
    }

    this.nextVoice++;
    this.nextVoice = this.nextVoice % this.voices.length;
  }

  noteOff(note: number, velocity: number = 0) {
    const voice = this.voices.find((v) => v.note === note);
    if (voice) {
      voice.gate = 0;
      // voice.note = -1;
    }
  }

  render() {
    const out = el.add(...this.voices.map((v) => this.voice(v)));
    return out;
  }
}

export default Synth;
