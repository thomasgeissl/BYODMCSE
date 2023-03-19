import { el } from "@elemaudio/core";

class Lowpass {
  constructor() {
    this.cutoffFrequency = 1000
  }

  render(signal) {
    const out = el.lowpass(this.cutoffFrequency, 1.414, signal)
    return out;
  }
}

export default Lowpass;
