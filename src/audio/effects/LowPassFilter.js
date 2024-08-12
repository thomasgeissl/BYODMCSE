import { el } from "@elemaudio/core";

class LowPassFilter{
  constructor(id) {
    this.id = id;
    // this.setParameter("cutOffFrequency", 500);
  }

  render(signal) {
    const out = el.lowpass(500, 1.414, signal);
    return out;
  }
}

export default LowPassFilter;
