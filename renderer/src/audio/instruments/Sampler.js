import { el } from "@elemaudio/core";
import { default as core } from "@elemaudio/node-renderer";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { Interval, Note, Scale } from "tonal";
import { v4 } from "uuid";
import Lowpass from "../effects/Lowpass.js";
import Highpass from "../effects/Highpass.js";

// https://www.youtube.com/watch?v=0voWrxLDnSE

const lowpass = new Lowpass();
const highpass = new Highpass();

class Sampler {
  constructor(voices) {
    this.voices = voices;
    this.voices = {
      60: {
        gate: 0.0,
        path: "/Users/thomasgeissl_1/projects/pdl/laser/assets/135472__kvgarlic__summeropenfielddusk.wav",
        key: `sampler-v1-${v4()}`,
      },
    };
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: 0.8 * voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    const out = el.sample({ path: voice.path, mode: "trigger" }, gate, 1.0);
    return out;
  };

  noteOn(note, velocity) {
    const voice = Object.entries(this.voices).find(([key, value]) => {
      return key == note;
    });
    if (voice) {
      voice[1].gate = 1.0;
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
    // const delayed = highpass.render(
      return lowpass.render(el.delay({ size: 44100 }, el.ms2samps(1000), 0.8, out))
    // );
    // return delayed;
  }
}

export default Sampler;
