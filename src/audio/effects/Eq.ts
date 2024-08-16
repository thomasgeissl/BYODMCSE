import { el } from "@elemaudio/core";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";

class EQ extends Base {
  constructor(id: string) {
    super(id);
  }

  render(signal: any) {
    const active = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "active");
    const lowGain = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "lowGain");
    const midGain = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "midGain");
    const highGain = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "highGain");
    const lowFreq = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "lowFreq");
    const highFreq = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "highFreq");

    if(!active){
      return signal;
    }

    const low = el.lowpass(
      lowFreq,
      1.41,
      el.mul(signal, el.const({ key: `eq-${this.id}-low-gain`, value: lowGain }))
    );
    
    const high = el.highpass(
      highFreq, 
      1.41,
      el.mul(signal, el.const({ key: `eq-${this.id}-high-gain`, value: highGain }))
    );

    const band = el.bandpass(
      (lowFreq + highFreq) / 2, 
      1.41,
      el.mul(signal, el.const({ key: `eq-${this.id}-mid-gain`, value: midGain }))
    );

    return el.add(low, band, high);
  }
}

export default EQ;
