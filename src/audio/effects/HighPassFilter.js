import { el } from "@elemaudio/core";

class HighPassFilter {
  constructor() {
    this.cutoffFrequency = 100
  }
  setCufOffFrequency(frequency){
    this.cutoffFrequency = frequency
  }

  render(signal) {
    const out = el.highpass(this.cutoffFrequency, 1.414, signal)
    return out;
  }
}

export default HighPassFilter;
