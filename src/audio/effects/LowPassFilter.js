import { el } from "@elemaudio/core";
import HasParameters from "../HasParameters";

class LowPassFilter extends HasParameters {
  constructor(id) {
    super();
    this.id = id;
    this.setParameter("cutOffFrequency", 500);
  }

  render(signal) {
    const out = el.lowpass(this.getParameter("cutOffFrequency"), 1.414, signal);
    return out;
  }
}

export default LowPassFilter;
