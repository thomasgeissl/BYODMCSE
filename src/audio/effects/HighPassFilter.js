import { el } from "@elemaudio/core";

class HighPassFilter{
  constructor(id) {
    this.id = id;
    // this.setParameter("cutOffFrequency", 500);
  }

  render(signal) {
    const out = el.highpass(
      500,
      1.414,
      signal
    );
    return out;
  }
}

export default HighPassFilter;
