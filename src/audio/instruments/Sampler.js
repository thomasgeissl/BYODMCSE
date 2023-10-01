import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import Lowpass from "../effects/LowPassFilter.js";
import HighPassFilter from "../effects/HighPassFilter.js";

// https://www.youtube.com/watch?v=0voWrxLDnSE

const VOICES_COUNT = 32;
const lowpass = new Lowpass();
const highpass = new HighPassFilter();

class Sampler {
  constructor(samples) {
    this.samples = samples;
    this.voices = [];
    for (let i = 0; i < VOICES_COUNT; i++) {
      this.voices.push({
        gate: 0.0,
        velocity: 0,
        key: `sampler-v${i}-${v4()}`,
        sample: null,
      });
    }
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    if (voice.sample) {
      const out = el.sample(
        { path: this.samples[voice.sample].path, mode: "trigger" },
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
    // turn of sample if currently played
    const oldVoice = this.voices.find((voice) => voice.sample === note);
    if (oldVoice) {
      oldVoice.gate = 0;
    }

    let voice = this.voices.find((voice) => voice.sample === null);
    if (!voice) {
      voice = this.voices.sort((a, b) => a.timestamp - b.timestamp)[
        this.voices.length - 1
      ];
    }

    if (voice) {
      voice.sample = note;
      voice.timestamp = new Date();
      voice.gate = 1.0;
      voice.velocity = velocity / 127;
    }
  }
  noteOff(note) {
    const voice = this.voices.find((voice) => {
      return voice.sample == note;
    });
    if (voice) {
      voice.gate = 0;
      voice.sample = null;
    }
  }

  render() {
    if (this.voices.filter((voice) => voice.sample != null).length === 0) {
      // TODO: is there a 0 node?
      return el.mul(el.cycle(440), 0);
    }
    const out = el.add(
      ...this.voices
        .filter((voice) => voice.sample != null)
        .map((voice) => {
          return this.voice(voice);
        })
    );
    return out;
    // return el.mul(0.9, out);
  }
}

export default Sampler;
