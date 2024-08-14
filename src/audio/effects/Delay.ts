import { el } from "@elemaudio/core";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";

class Delay extends Base{
  constructor(id: string) {
    super(id);
  }

  render(signal: any) {
    const wetParam = useLiveSetStore.getState().getParameterValue(this.id, "wet")
    const timeParam = useLiveSetStore.getState().getParameterValue(this.id, "time")
    const wet = el.delay(
      { size: 44100 },
      el.ms2samps(timeParam),
      0,
      signal
    );
    return el.add(
      el.mul(1 - wetParam, signal),
      el.mul(wetParam, wet)
    );
  }
}

export default Delay;
