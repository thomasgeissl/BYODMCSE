import { el } from "@elemaudio/core";
// import { Interval, Note, Scale, Midi } from "tonal";
import Synth from "./instruments/Synth";
import Noise from "./instruments/Noise.js";
import TapeNoise from "./instruments/TapeNoise.js";
import GrainTrain from "./instruments/GrainTrain.js";
import LowPassFilter from "./effects/LowPassFilter.js";
import HighPassFilter from "./effects/HighPassFilter.js";
import Delay from "./effects/Delay.js";
import Velocity from "./midiEffects/Velocity.js";
import DrumRack from "./instruments/DrumRack.js";
import Simpler from "./instruments/Simpler";

interface Config {
  tracks: any[]
}

class Orchestra {
  channels: any
  constructor(config: Config) {
    this.channels = {};
    config.tracks.forEach((track: any) => {
      const {midiChannel, instrument, effects, midiEffects} = track
      if(!this.channels[midiChannel]){
        this.channels[midiChannel] = [];
      }
      switch(instrument?.type){
        case "synth": {
          this.channels[midiChannel].push({
            instrument: new Synth(instrument.id),
            effects: [],
          });
          break;
        }
        case "drumRack": {
          this.channels[midiChannel].push({
            instrument: new DrumRack(
              instrument.id,
              instrument.config
            ),
            effects: [],
          })
          break;
        }
        case "simpler": {
          this.channels[midiChannel].push({
            instrument: new Simpler(
              instrument.id,
              instrument.config
            ),
            effects: [],
          })
          break;
        }
        case "noise": {
          this.channels[midiChannel].push({
            instrument: new Noise(instrument.id),
            effects: [],
        })
          break;
        }
        case "grainTrain": {
          this.channels[midiChannel].push({
            instrument: new GrainTrain(instrument.id),
            effects: [],
          });
          break;
        }
        case "tapeNoise": {
          this.channels[midiChannel].push({
            instrument: new TapeNoise(instrument.id),
            effects: [],
          });
          break;
        }
      }
    })
  }

  noteOn(channel: number, note: number, velocity: number) {
    this.channels[channel].forEach((instrument: any) => instrument?.instrument?.noteOn(note, velocity))
  }
  noteOff(channel: number, note: number, velocity: number = 0) {
    this.channels[channel].forEach((instrument: any) => instrument?.instrument?.noteOff(note, velocity))
  }
  render() {
    const signals = Object.values(this.channels).map((channel: any) => {
      const instrumentSignals = channel.map((entry: any) => {
        let signal = entry.instrument?.render();
        // Process effects if necessary
        // entry.effects.forEach((effect: any) => {
        //   signal = effect.render(signal);
        // });
        return signal;
      });
      return el.add(...instrumentSignals);
    });
    const out = el.add(...signals);
    // const out = el.cycle(440)//add(...signals);
    return out;
  }
}

export default Orchestra;
