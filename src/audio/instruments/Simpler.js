import { el } from "@elemaudio/core";
import { v4 } from "uuid";

const NUM_VOICES = 16;
class Simpler {
  constructor(id, samples) {
    this.id = id;
    this.samples = samples;

    this.voices = Array.apply(null, Array(NUM_VOICES)).map((voice, index) => {
      return {
        gate: 0,
        velocity: 0,
        sampleId: null,
        key: `simpler-v${index}-${v4()}`,
      };
    });
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    if (voice.sampleId === null) {
      return el.mul(el.cycle(0), 0);
    }
    // TODO: calc play speed
    // TODO: change mechanism to stop sample, use gate instead of setting sampleId/note to null
    const out = el.sample(
      { path: this.samples[voice.sampleId].path, mode: "trigger" },
      gate,
      1.0
    );
    return el.mul(out, voice.velocity);
  };

  noteOn(note, velocity) {
    const voice = this.voices[0];
    if (voice) {
      const sampleIds = Object.keys(this.samples);
      let sampleDistance = 127;
      let sampleId = null;
      sampleIds.forEach((id) => {
        const distance = Math.abs(note, id);
        if (distance < sampleDistance) {
          sampleDistance = distance;
          sampleId = id;
        }
      });
      voice.sampleId = sampleId;
      voice.note = note;
      voice.timestamp = new Date();
      voice.gate = 1.0;
      voice.velocity = velocity / 127;
    }
  }
  noteOff(note) {
    const voice = this.voices.find((voice) => voice.note === note);
    if (voice) {
      voice.note = null;
      voice.gate = 0;
      voice.velocity = 0;
      voice.sampleId = null;
    }
  }

  render() {
    const out = el.add(
      ...Object.values(this.voices)
        // .filter((voice) => voice.sampleId !== null)
        .map((voice) => {
          return this.voice(voice);
        })
    );
    return out;
  }
}

export default Simpler;
