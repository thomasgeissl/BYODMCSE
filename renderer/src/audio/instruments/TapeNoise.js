import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import { Interval, Note, Scale, Midi } from "tonal";
// https://twitter.com/ubcomposer/status/1647659387396169728?s=46&t=Z3VnznKKxadB7DXpOQN7dg

class TapeNoise {
  constructor() {
    this.voices = [
        { gate: 0.0, note: 0, velocity: 0, key: `tape_noise-v1-${v4()}` },
        //   { gate: 0.0, note: 0, key: `synth-v9-${v4()}` },
        //   { gate: 0.0, note: 0, key: `synth-v10-${v4()}` },
      ];
      

  }
  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.adsr(1.0, 1.0, 1.0, 2.0, gate);
    const frequency = Midi.midiToFreq(voice.note);

    const value = el.latch(el.train(0.01), el.noise());
    // const env = el.adsr(el.tau2pole(0.1), el.tau2pole(2.1), 0, 0, el.train(10));
    // return value
    const noiseAmount = el.mul(
      100,
      el.latch(el.train(Math.random() * 100), el.abs(el.noise()))
    );
    const noiseSignal = el.mul(
      el.cycle(el.cycle(value)),
      el.latch(el.train(Math.random() * 10), el.noise())
    );
    return el.mul(
      0.7,
      env,
      el.allpass(
        el.mul(10000, el.latch(el.train(2), el.abs(el.noise()))),
        noiseAmount,
        noiseSignal
      )
    );
    // return el.mul(
    //   env,
    //   // gate,
    //   el.cycle(
    //     el.const({
    //       key: `frequency-${voice.key}`,
    //       value: frequency,
    //     })
    //   )
    // );
  };
  noteOn(note, velocity) {
    this.voices[0].gate = 1
    this.voices[0].note = note
    this.voices[0].velocity = velocity
  }
  noteOff(note) {
    this.voices[0].gate = 0
  }
  render() {
    const out = el.add(...this.voices.map((v) => this.voice(v)));
    return out;
  }
}

export default TapeNoise;
