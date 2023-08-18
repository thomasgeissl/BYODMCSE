import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import Lowpass from "../effects/LowPassFilter.js";
import HighPassFilter from "../effects/HighPassFilter.js";

// https://www.youtube.com/watch?v=0voWrxLDnSE

const lowpass = new Lowpass();
const highpass = new HighPassFilter();

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
        sample: null
      });
    }
    // this.voices = voices;
    // Object.values(this.voices).forEach((voice, index) => {
    //   voice.gate = 0.0;
    //   voice.velocity = 0;
    //   voice.key = `sampler-v${index}-${v4()}`;
    // });
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    const out = el.sample({ path: voice.path, mode: "trigger" }, gate, 1.0);
    return el.mul(out, voice.velocity);
  };

  noteOn(note, velocity) {
    // turn of sample if currently played
    this.voices.find(voice => voice.sample === note)?.gate = 0

    let voice = this.voices.find(voice => voice.sample === null)
    if(!voice){
      voice = this.voices.sort((a, b) => a.timestamp - b.timestamp)[this.voices.length - 1]
    }
    
    if (voice) {
      voice.sample = note
      voice.timestamp = new Date()
      voice[1].gate = 1.0;
      voice[1].velocity = velocity / 127;
    }
  }
  noteOff(note) {
    const voice = this.voices.find((voice) => {
      return value.sample == note;
    });
    if (voice) {
      voice.gate = 0;
      voice.sample = null;
    }
  }
  render() {
    const out = el.add(
      ...this.voices.map((voice) => {
        return this.voice(voice);
      })
    );
    return out;
    // return el.mul(0.9, out);
  }
}

export default Sampler;
