import { el } from "@elemaudio/core";
import HasParameters from "../HasParameters.ts";

class HighPassFilter extends HasParameters {
  constructor(id) {
    super();
    this.id = id;
    this.setParameter("cutOffFrequency", 500);
  }

  render(signal) {
    const out = el.highpass(
      this.getParameterValue("cutOffFrequency"),
      1.414,
      signal
    );
    return out;
  }
}

export default HighPassFilter;
