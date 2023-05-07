import { el } from "@elemaudio/core";

class Highpass {
  constructor() {
    this.cutoffFrequency = 100
  }

  render(signal) {
    const out = el.highpass(this.cutoffFrequency, 1.414, signal)
    return out;
  }
}

export default Highpass;
