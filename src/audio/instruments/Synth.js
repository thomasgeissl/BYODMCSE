import { el } from "@elemaudio/core";
import { Interval, Note, Scale, Midi } from "tonal";
import { v4 } from "uuid";

// https://www.youtube.com/watch?v=0voWrxLDnSE

class Synth {
  constructor() {
    this.voices = [
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v1-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v2-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v3-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v4-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v5-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v6-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v7-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `synth-v8-${v4()}` },
      //   { gate: 0.0, note: 0, key: `synth-v9-${v4()}` },
      //   { gate: 0.0, note: 0, key: `synth-v10-${v4()}` },
    ];
  }
  nextVoice = 0;
  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.adsr(1.0, 1.0, 1.0, 2.0, gate);
    const frequency = Midi.midiToFreq(voice.note);
    return el.mul(
      // env,
      gate,
      el.cycle(
        el.const({
          key: `frequency-${voice.key}`,
          value: frequency,
        })
      )
    );
  };
  noteOn(note, velocity) {
    const voiceIndex = this.voices.findIndex((v) => v.note === note);
    if (voiceIndex >= 0) {
      this.voices[voiceIndex].gate = 1.0;
      this.voices[voiceIndex].note = note;
      this.voices[voiceIndex].velocity = velocity;
    } else {
      this.voices[this.nextVoice].gate = 1.0;
      this.voices[this.nextVoice].note = note;
    }

    this.nextVoice++;
    this.nextVoice = this.nextVoice % this.voices.length;
  }
  noteOff(note) {
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
