import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import Lowpass from "../effects/LowPassFilter.js";
import HighPassFilter from "../effects/HighPassFilter.js";

// https://www.youtube.com/watch?v=0voWrxLDnSE

const lowpass = new Lowpass();
const highpass = new HighPassFilter();

class Sampler {
  constructor(voices) {
    this.voices = voices;
    Object.values(this.voices).forEach((voice, index) => {
      voice.gate = 0.0;
      voice.velocity = 0;
      voice.key = `sampler-v${index}-${v4()}`;
    });
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
    const voice = Object.entries(this.voices).find(([key, value]) => {
      return key == note;
    });
    if (voice) {
      voice[1].gate = 1.0;
      voice[1].velocity = velocity/127;
    }
  }
  noteOff(note) {
    const voice = Object.entries(this.voices).find(([key, value]) => {
      return key == note;
    });
    if (voice) {
      voice[1].gate = 0;
    }
  }
  render() {
    // console.log(Object.values(this.voices))
    const voices = Object.values(this.voices);
    const out = el.add(
      ...voices.map((voice) => {
        return this.voice(voice);
      })
    );
    return out
    // return el.mul(0.9, out);
  }
}

export default Sampler;
