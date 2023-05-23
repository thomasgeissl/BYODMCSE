import { el } from "@elemaudio/core";

class Velocity {
  constructor() {
    
  }

  noteOn(channel, note, velocity) {
    return {channel, note, velocity}
  }
  noteOff(channel, note) {
  }
}

export default Velocity;
