import { el } from "@elemaudio/core";
import { v4 } from "uuid";

class Sampler {
  constructor(samples) {
    this.samples = samples;
    this.voices = [];
    const VOICES_COUNT = 32;
    for (let i = 0; i < VOICES_COUNT; i++) {
      this.voices.push({
        gate: 0.0,
        velocity: 0,
        key: `sampler-v${i}-${v4()}`,
        sampleId: null,
      });
    }
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    if (voice?.sampleId) {
      const out = el.sample(
        { path: this.samples[voice.sampleId].path, mode: "trigger" },
        gate,
        1.0
      );
      return el.mul(out, voice.velocity);
    } else {
      // TODO
      return el.mul(el.cycle(), 0);
    }
  };

  noteOn(note, velocity) {
    console.log("playing note", note);
    // turn off sample if currently played
    const oldVoice = this.voices.find((voice) => voice.sampleId === note);
    if (oldVoice) {
      console.log("turn off currentlz playing samples");
      oldVoice.gate = 0;
      oldVoice.velocity = 0;
    }

    let voice = this.voices.find((voice) => voice.sampleId === null);
    if (!voice) {
      voice = this.voices.sort((a, b) => a.timestamp - b.timestamp)[
        this.voices.length - 1
      ];
    }

    if (voice) {
      voice.sampleId = note;
      voice.timestamp = new Date();
      voice.gate = 1.0;
      voice.velocity = velocity / 127;
    }
  }
  noteOff(note) {
    const voice = this.voices.find((voice) => {
      return voice.sampleId === note;
    });
    if (voice) {
      voice.gate = 0;
      voice.velocity = 0;
      voice.sampleId = null;
    }
  }

  render() {
    if (this.voices.filter((voice) => voice.sampleId !== null).length === 0) {
      // TODO: is there a 0 node?
      return el.mul(el.cycle(440), 0);
    }
    const out = el.add(
      ...this.voices
        .filter((voice) => voice.sampleId !== null)
        .map((voice) => {
          return this.voice(voice);
        })
    );
    return out;
    // return el.mul(0.9, out);
  }
}

export default Sampler;
