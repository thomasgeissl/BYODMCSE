import { useEffect, useState } from "react";
import { Box, Button, ToggleButton, Typography } from "@mui/material";
import WebRenderer from "@elemaudio/web-renderer";
import Orchestra from "../audio/Orchestra";
import staticConfig from "../assets/config.json";
import { useSearchParams } from "react-router-dom";
import { loadSample } from "../audio/utils";
import Keyboard from "./Keyboard";
import axios from "axios";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

let ctx: AudioContext;
const core = new WebRenderer();
let config = staticConfig;

function SoundCheck() {
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orchestra, setOrchestra] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [armedInstruments, setArmedInstruments] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get("config")) {
      const configPath = searchParams.get("config");
      if (configPath) {
        axios.get(configPath).then((response) => {
          try {
            config = JSON.parse(response.data);
          } catch (error) {
            console.error("Error parsing config:", error);
          }
        });
      }
    }
  }, [searchParams]);

  const init = async () => {
    setLoading(true);
    ctx = new window.AudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    core.on("load", async () => {
      const files: any = {};
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

  const handleKeyPressed = (note: number) => {
    console.log(`Key Pressed: MIDI number ${note}`);
    if (orchestra) {
      armedInstruments.map(i => {
        console.log(i)
        orchestra.noteOn(i.channel, note, 100);
      })
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  const handleKeyReleased = (note: number) => {
    console.log(`Key Released: MIDI number ${note}`);
    if (orchestra) {
      armedInstruments.map(i => {
        orchestra.noteOff(i.channel, note, 0);
      })
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  const toggleInstrument = (instrument: any, channel: any) => {
    setArmedInstruments((prevArmedInstruments) => {
      const index = prevArmedInstruments.findIndex(
        (armedInstrument) => armedInstrument.id === instrument.id
      );
      if (index > -1) {
        return prevArmedInstruments.filter(
          (armedInstrument) => armedInstrument.id !== instrument.id
        );
      } else {
        return [...prevArmedInstruments, {...instrument, channel}];
      }
    });
  };

  return (
    <Box>
      {!inited && (
        <Button onClick={init} variant={"contained"} size="large">
          dsp
        </Button>
      )}

      <Box display={"flex"} gap={2} marginBottom={"24px"}>
        {Object.entries(config?.orchestra)?.map(([channel, value], index) => {
          const { instrument } = value;
          return (
            <Box key={instrument?.id}>
              <Box display={"flex"} flexDirection={"column"} gap={1}>
                <Box>id: {instrument.id}</Box>
                <Box>
                  type: {instrument.type} <br></br>
                </Box>
                <Box>ch: {channel}</Box>

                <ToggleButton
                  selected={armedInstruments.findIndex(i => i.id === instrument.id) > -1}
                  value={instrument.id}
                  onClick={() => toggleInstrument(instrument, channel)}
                >
                  <FiberManualRecordIcon></FiberManualRecordIcon>
                </ToggleButton>
              </Box>
            </Box>
          );
        })}
      </Box>

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
