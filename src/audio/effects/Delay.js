import { el } from "@elemaudio/core";

class Delay {
  constructor() {
  }

  render(signal) {
    const out = el.delay({size: 44100}, el.ms2samps(1000), 0.3, signal)
    return out;
  }
}

export default Delay;
