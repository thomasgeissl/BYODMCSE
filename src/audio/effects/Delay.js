import { el } from "@elemaudio/core";
import HasParameters from "../HasParameters";

class Delay extends HasParameters {
  constructor(id) {
    super();
    this.id;
    this.setParameter("time", 1000);
    this.setParameter("dry", 0.7);
  }

  render(signal) {
    const dry = el.delay(
      { size: 44100 },
      el.ms2samps(this.getParameter("time")),
      0,
      signal
    );
    return el.add(
      el.mul(1 - this.getParameter("dry"), signal),
      el.mul(this.getParameter("dry"), dry)
    );
  }
}

export default Delay;
