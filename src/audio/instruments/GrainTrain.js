import { el } from "@elemaudio/core";
import { v4 } from "uuid";

// https://github.com/zya/granular/blob/gh-pages/js/main.js

class GrainTrain {
  constructor() {
    this.voices = [
      { gate: 0.0, note: 0, velocity: 0, key: `grainTrain-v1-${v4()}` },
    ];
  }
  voice = (voice) => {
    // Our phasors. The second, `t2`, is derived from `t` and offset by exactly
    // half a cycle.
    let t = el.phasor(1, 0);
    let t2 = el.sub(el.add(t, 0.5), el.floor(el.add(t, 0.5)));

    // Next we derive our "reader" signals, `r` and `r2`, by swinging a slow sine
    // shaped LFO within [0, 1] and summing our phasors into it, multiplying each
    // phasor by 0.01 to ensure that it only sweeps through a tiny portion of the buffer (a grain).
    let o = el.mod(
      el.add(el.phasor(0.01, 0), el.latch(el.train(4), el.rand())),
      1
    ); // el.mul(0.2, el.add(1, el.cycle(0.01)));
    let r = el.add(o, el.mul(0.001, t));
    let r2 = el.add(o, el.mul(0.001, t2));

    // Then here we put it together: a lowpass filter with cutoff modulation running
    // over the sum of the two grain readers: each grain reader is a hann window multiplied
    // by the result of the `el.table` read.
    return el.lowpass(
      el.add(1200, el.mul(800, el.cycle(0.1))),
      0.717,
      el.add(
        el.mul(el.hann(t), el.table({ path: "/samples/number_1.wav" }, r)),
        el.mul(el.hann(t2), el.table({ path: "/samples/number_1.wav" }, r2))
      )
    );
  };
  noteOn(note, velocity) {
    this.voices[0].gate = 1.0;
    this.voices[0].note = note;
    this.voices[0].velocity = velocity;
  }
  noteOff(note) {
    this.voices[0].gate = 0;
    this.voices[0].note = note;
    this.voices[0].velocity = 0;
  }
  render() {
    const out = el.add(...this.voices.map((v) => this.voice(v)));
    return out;
  }
}

export default GrainTrain;
