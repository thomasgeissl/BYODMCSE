import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import WebRenderer from "@elemaudio/web-renderer";
import Orchestra from "../audio/Orchestra";
import staticConfig from "../assets/config.json";
import { useSearchParams } from "react-router-dom";
import { loadSample } from "../audio/utils";
import Keyboard from "./Keyboard";

let ctx;
const core = new WebRenderer();
let config = staticConfig;

function SoundCheck() {
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orchestra, setOrchestra] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("config")) {
      const configPath = searchParams.get("config");
      axios.get(configPath).then((response) => {
        try {
          config = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing config:", error);
        }
      });
    }
  }, [searchParams]);

  const init = async () => {
    setLoading(true);
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    core.on("load", async () => {
      const files = {};
      const entries = Object.entries(config.files);
      for (let i = 0; i < entries.length; i++) {
        const [key, path] = entries[i];
        files[key] = await loadSample(path, ctx);
      }

      core.updateVirtualFileSystem(files);
      const orchestra = new Orchestra(config.orchestra);
      setOrchestra(orchestra);
      setLoading(false);
      setInited(true);
    });

    const node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);
  };

  const handleKeyPressed = (midi) => {
    console.log(`Key Pressed: MIDI number ${midi}`);
    if (orchestra) {
      orchestra.noteOn(11, midi, 100);
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  const handleKeyReleased = (midi) => {
    console.log(`Key Released: MIDI number ${midi}`);
    if (orchestra) {
      orchestra.noteOff(11, midi, 0);
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  return (
    <Box>
      {!inited && (
        <Button onClick={init} variant={"contained"} size="large">
          dsp
        </Button>
      )}

      <Box>
        <Keyboard
          onKeyPressed={handleKeyPressed}
          onKeyReleased={handleKeyReleased}
        />
      </Box>
    </Box>
  );
}

export default SoundCheck;
