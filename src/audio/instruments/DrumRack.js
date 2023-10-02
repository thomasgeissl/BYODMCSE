import { el } from "@elemaudio/core";
import { v4 } from "uuid";
import HasParameters from "../HasParameters";

class DrumRack extends HasParameters {
  constructor(id, samples) {
    super();
    this.id = id;
    this.voices = samples;

    Object.values(this.voices).forEach((voice, index) => {
      voice.gate = 0;
      voice.velocity = 0;
      voice.key = `drumrack-v${index}-${v4()}`;
    });

    this.setParameter("testparam", 0);
    this.setParameter("volume", 1);
  }

  voice = (voice) => {
    const gate = el.const({
      key: `gate-${voice.key}`,
      value: voice.gate,
    });
    const env = el.env(4.0, 1.0, 0.4, 2.0, gate);
    const out = el.sample({ path: voice.path, mode: "trigger" }, gate, 1.0);
    return el.mul(out, voice.velocity);
  };

  noteOn(note, velocity) {
    const voice = Object.entries(this.voices).find(([key, value]) => {
      return key == note;
    });
    if (voice) {
      voice.timestamp = new Date();
      voice[1].gate = 1.0;
      // TODO: setting a new key to restart the sample seems quite hacky, what are smarter ways of doing this?
      voice[1].key = `drumrack-${v4()}`;
      voice[1].velocity = velocity / 127;
    }
  }
  noteOff(note) {}

  render() {
    const voices = Object.values(this.voices);
    const out = el.add(
      ...voices.map((voice) => {
        return this.voice(voice);
      })
    );
    return el.mul(this.getParameter("volume"), out);
  }
}

export default DrumRack;
