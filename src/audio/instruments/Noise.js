import { el } from "@elemaudio/core";
// import { default as core } from "@elemaudio/node-renderer";
// import { dirname, resolve } from "path";
// import { fileURLToPath } from "url";
import { Interval, Note, Scale, Midi } from "tonal";
import { v4 } from "uuid";

// https://www.youtube.com/watch?v=0voWrxLDnSE

class Noise {
  constructor(id) {
    this.id = id;
    this.gate = 0;
    this.key = `noise-v1-${v4()}`;
  }
  noteOn(note, velocity) {
    this.gate = 1.0;
  }
  noteOff(note) {
    this.gate = 0;
  }
  render() {
    const gate = el.const({
      key: `gate-${this.key}`,
      value: this.gate,
    });
    return el.mul(gate, el.noise());
    // return el.noise()
  }
}

export default Noise;
