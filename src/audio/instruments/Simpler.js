import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import HasParameters from "../HasParameters";

class Simpler extends HasParameters {
  constructor(id, config) {
    super();
    this.id = id;
    const {sample} = config;
    this.sample = sample;

    this.voices = [
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v1-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v2-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v3-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v4-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v5-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v6-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v7-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v8-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v9-${v4()}` },
      { gate: 0.0, note: 0, velocity: 0, key: `simpler-v10-${v4()}` },
    ];
    this.nextVoice = 0;

    this.setParameter("volume", 1);
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const pitch = el.const({
      key: `pitch-${voice.key}`,
      value: Math.pow(2, (voice.note - 69) / 12),
    });
    const env = el.adsr(0.01, 0.1, 0.7, 0.2, gate); 
    const sample = el.sample({ path: this.sample.path, mode: "gate" }, gate, pitch);
    const out = el.mul(sample, env, voice.velocity);
    return out;
  };

  noteOn(note, velocity) {
    const voiceIndex = this.voices.findIndex((v) => v.note == note);
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
    const voice = this.voices.find((v) => v.note == note);
    if (voice) {
      voice.gate = 0;
    }
  }

  render() {
    const out = el.add(...this.voices.map((v) => this.voice(v)));
    return el.mul(this.getParameter("volume"), out);
  }
}

export default Simpler;
