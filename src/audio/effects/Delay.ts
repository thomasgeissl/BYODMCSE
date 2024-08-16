import { el } from "@elemaudio/core";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";

class Delay extends Base {
  constructor(id: string) {
    super(id);
  }

  render(signal: any) {
    const active = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "active");
    const mixParam = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "mix");
    const timeParam = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "time");
    
    const wet = el.delay(
      { size: 44100 },
      el.ms2samps(timeParam),
      0,
      signal
    );

    if(!active){
      return signal
    }

    return el.add(
      el.mul(
        el.const({
          key: `delay-${this.id}-dry`,
          value: 1 - mixParam,
        }),
        signal
      ),
      el.mul(
        el.const({
          key: `delay-${this.id}-wet`,
          value: mixParam,
        }),
        wet
      )
    );
  }
}

export default Delay;
