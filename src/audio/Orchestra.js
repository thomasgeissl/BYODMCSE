import { el } from "@elemaudio/core";
// import { Interval, Note, Scale, Midi } from "tonal";
import Synth from "./instruments/Synth.js";
import Sampler from "./instruments/Sampler.js";
import Noise from "./instruments/Noise.js";
import TapeNoise from "./instruments/TapeNoise.js";
import GrainTrain from "./instruments/GrainTrain.js";
import LowPassFilter from "./effects/LowPassFilter.js";
import HighPassFilter from "./effects/HighPassFilter.js";
import Delay from "./effects/Delay.js";
import Velocity from "./midiEffects/Velocity.js";

class Orchestra {
  constructor(config) {
    this.channels = {};
    Object.entries(config).forEach(([key, value]) => {
      // add instruments
      switch (value.instrument.type) {
        case "synth": {
          this.channels[key] = { instrument: new Synth(), effects: [] };
          break;
        }
        case "sampler": {
          this.channels[key] = { instrument: new Sampler(value.instrument.config), effects: [] };
          break;
        }
        case "noise": {
          this.channels[key] = { instrument: new Noise(), effects: [] };
          break;
        }
        case "grainTrain": {
          this.channels[key] = { instrument: new GrainTrain(), effects: [] };
          break;
        }
        case "tapeNoise": {
          this.channels[key] = { instrument: new TapeNoise(), effects: [] };
          break;
        }
      }

      // add effects
      value.effects.forEach((effectConfig) => {
        let effect;
        switch (effectConfig.type) {
          case "lowPassFilter": {
            effect = new LowPassFilter();
            break;
          }
          case "highPassFilter": {
            effect = new HighPassFilter();
            break;
          }
          case "delay": {
            effect = new Delay();
            break;
          }
        }
        if (effect) {
          this.channels[key].effects.push(effect);
        }
      });
      // add effects
      value.midiEffects.forEach((effectConfig) => {
        let effect;
        switch (effectConfig.type) {
          case "velocity": {
            effect = new Velocity();
            break;
          }
        }
        if (effect) {
          this.channels[key].midiEffects.push(effect);
        }
      });
    });
  }

  noteOn(channel, note, velocity) {
    this.channels[channel]?.instrument.noteOn(note, velocity);
  }
  noteOff(channel, note) {
    this.channels[channel]?.instrument.noteOff(note);
  }
  render() {
    const signals = Object.values(this.channels).map((channel) => {
      let signal = channel.instrument.render();
      channel.effects.forEach((effect) => {
        signal = effect.render(signal);
      });
      return signal;
    });
    const out = el.add(...signals);
    return out;
  }
}

export default Orchestra;
