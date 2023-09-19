import { el } from "@elemaudio/core";
import { v4 } from "uuid";

class DrumRack {
  constructor(samples) {
    this.voices = samples;
    Object.values(this.voices).forEach((voice, index) => {
      voice.gate = 0;
      voice.velocity = 0;
      voice.key = `drumrack-v${index}-${v4()}`;
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
    const voice = this.voices[note];
    if (voice) {
      voice.timestamp = new Date();
      voice.gate = 1.0;
      voice.velocity = velocity / 127;
    }
  }
  noteOff(note) {}

  render() {
    // if (this.voices.filter((voice) => voice.sampleId !== null).length === 0) {
    //   // TODO: is there a 0 node?
    //   return el.mul(el.cycle(440), 0);
    // }
    const out = el.add(
      ...Object.values(this.voices)
        // .filter((voice) => voice.sampleId !== null)
        .map((voice) => {
          return this.voice(voice);
        })
    );
    return out;
    // return el.mul(0.9, out);
  }
}

export default DrumRack;
