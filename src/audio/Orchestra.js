import { el } from "@elemaudio/core";
// import { Interval, Note, Scale, Midi } from "tonal";
import Synth from "./instruments/Synth.js";
import Sampler from "./instruments/Sampler.js";
import Noise from "./instruments/Noise.js";
import TapeNoise from "./instruments/TapeNoise.js";

class Orchestra {
  constructor(config) {
    this.instruments = {}
    Object.entries(config).forEach(([key, value]) => {
        switch (value.type) {
          case "synth": {
            this.instruments[key] = { instrument: new Synth() };
            break;
          }
          case "sampler": {
            this.instruments[key] = { instrument: new Sampler() };
            break;
          }
          case "noise": {
            this.instruments[key] = { instrument: new Noise() };
            break;
          }
          case "tape_noise": {
            this.instruments[key] = { instrument: new TapeNoise(value.effects) };
            break;
          }
        }
      });
  }

  noteOn(channel, note, velocity){
    this.instruments[channel].instrument.noteOn(note, velocity);
  }
  noteOff(channel, note){
    this.instruments[channel].instrument.noteOff(note);
  }
  render() {
    const signals = Object.values(this.instruments).map((instrument) => {
      return instrument.instrument.render();
    });
    const out = el.add(...signals);
    return out
  }
}

export default Orchestra;
