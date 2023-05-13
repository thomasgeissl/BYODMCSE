import { el } from "@elemaudio/core";

class LowPassFilter {
  constructor() {
    this.cutoffFrequency = 1000
  }
  setCufOffFrequency(frequency){
    this.cutoffFrequency = frequency
  }

  render(signal) {
    const out = el.lowpass(this.cutoffFrequency, 1.414, signal)
    return out;
  }
}

export default LowPassFilter;
