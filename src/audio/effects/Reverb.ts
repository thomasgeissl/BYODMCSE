import { el } from "@elemaudio/core";
import Base from "./Base";
import useLiveSetStore from "../../store/liveSet";

class Reverb extends Base{
  constructor(id: string) {
    super(id);
  }

  render(signal: any) {
    const wetParam = useLiveSetStore.getState().getParameterValue(this.id, "wet")
    return signal
    
  }
}

export default Reverb;
