import { el } from "@elemaudio/core";
import Base from "./Base";

class Delay extends Base{
  constructor(id) {
    super(id);
    // this.setParameter("time", 1000);
    // this.setParameter("dry", 0.7);
  }

  render(signal) {
    const dry = el.delay(
      { size: 44100 },
      el.ms2samps(1000),
        // this.getParameterValue("time")),
      0,
      signal
    );
    return el.add(
      el.mul(1 - 0.7, signal),
      el.mul(0.7, dry)
    );
  }
}

export default Delay;
