import { el } from "@elemaudio/core";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";

class Distortion extends Base {
  constructor(id: string) {
    super(id);
  }

  render(signal: any) {
    const active = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "active");
    const drive = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "drive");
    const mix = useLiveSetStore
      .getState()
      .getParameterValue(this.id, "mix");
    
    if (!active) {
      return signal;
    }

    // Apply soft clipping and saturation
    const drivenSignal = el.tanh(
      el.mul(signal, el.const({ key: `distortion-${this.id}-drive`, value: drive }))
    );

    // Warm up the sound with a low-pass filter
    const warmedSignal = el.lowpass(
      el.const({ key: `distortion-${this.id}-filter-freq`, value: 12000 }), // Slightly reduce high frequencies
      1.41,
      drivenSignal
    );

    // Blend the original and distorted signals
    return el.add(
      el.mul(
        el.const({ key: `distortion-${this.id}-dry`, value: 1 - mix }),
        signal
      ),
      el.mul(
        el.const({ key: `distortion-${this.id}-wet`, value: mix }),
        warmedSignal
      )
    );
  }
}

export default Distortion;
