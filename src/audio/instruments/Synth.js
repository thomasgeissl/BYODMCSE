import { el } from "@elemaudio/core";
import { Interval, Note, Scale, Midi } from "tonal";
import { v4 } from "uuid";
import HasParameters from "../HasParameters";

// https://www.youtube.com/watch?v=0voWrxLDnSE


class Synth extends HasParameters {
  constructor(id) {
    super();
    this.id = id;
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
    // Initialize parameters for each oscillator
    this.setParameter("waveformA", "sine");
    this.setParameter("amplitudeA", 0.4);
    this.setParameter("detuneA", 1.03);
    this.setParameter("waveformB", "saw");
    this.setParameter("amplitudeB", 0.02);
    this.setParameter("detuneB", 0.2);
    this.setParameter("waveformC", "sine");
    this.setParameter("amplitudeC", 0.2);
    this.setParameter("detuneC", 0.1);
  }

  nextVoice = 0;

  getWaveform = (waveform, frequency) => {
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
  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.adsr(1.0, 1.0, 1.0, 2.0, gate);
    const frequency = Midi.midiToFreq(voice.note);
    // Oscillator A
    const oscA = el.mul(
      this.getParameter("amplitudeA"),
      this.getWaveform(
        this.getParameter("waveformA"),
        el.const({
          key: `frequencyA-${voice.key}`,
          value: frequency * this.getParameter("detuneA"),
        })
      )
    );

    // Oscillator B
    const oscB = el.mul(
      this.getParameter("amplitudeB"),
      this.getWaveform(
        this.getParameter("waveformB"),
        el.const({
          key: `frequencyB-${voice.key}`,
          value: frequency * this.getParameter("detuneB"),
        })
      )
    );

    // Oscillator C
    const oscC = el.mul(
      this.getParameter("amplitudeC"),
      this.getWaveform(
        this.getParameter("waveformC"),
        el.const({
          key: `frequencyC-${voice.key}`,
          value: frequency * this.getParameter("detuneC"),
        })
      )
    );

    const signal = el.add(oscA, oscB, oscC);
    return el.mul(env, signal, voice.velocity);
  };

  noteOn(note, velocity) {
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
