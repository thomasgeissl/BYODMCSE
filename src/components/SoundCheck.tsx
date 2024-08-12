import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import WebRenderer from "@elemaudio/web-renderer";
import Orchestra from "../audio/Orchestra";
import staticConfig from "../assets/config.json";
import { useSearchParams } from "react-router-dom";
import { loadSample } from "../audio/utils";
import Keyboard from "./Keyboard";
import axios from "axios";
import Instrument from "./Instrument";
import useLiveSetStore from "../store/liveSet";
import Tracks from "./Tracks";

let ctx: AudioContext;
const core = new WebRenderer();
let config = staticConfig;

function SoundCheck() {
  const initOrchestra = useLiveSetStore(state => state.init)
  const tracks = useLiveSetStore(state => state.tracks)
  const armedTracks = useLiveSetStore(state => state.armedTracks)
  const selectedInstrumentId = useLiveSetStore(state => state.selectedInstrument)
  useEffect(()=>{
    initOrchestra(null)
  }, [])
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orchestra, setOrchestra] = useState<any>(null);
  const [searchParams] = useSearchParams();

  const instruments = tracks.map(track => track.instrument)
  const selectedInstrument = instruments.find(instrument => instrument.id === selectedInstrumentId)

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
      const orchestra = new Orchestra(config);
      console.log(orchestra)
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

  const handleKeyPressed = (note: number, velocity: number) => {
    if (orchestra) {
      tracks.filter(track => armedTracks.includes(track.id))?.map((i) => {
        orchestra.noteOn(i.midiChannel, note, velocity);
      });
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  const handleKeyReleased = (note: number, velocity: number) => {
    if (orchestra) {
      tracks.filter(track => armedTracks.includes(track.id))?.map((i) => {
        orchestra.noteOff(i.midiChannel, note, velocity);
      });
      const mainOut = orchestra?.render();
      core?.render(mainOut, mainOut);
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"} sx={{ padding: "24px" }}>
      {!inited && (
        <Box sx={{ margin: "24px" }} display={"flex"}>
          <Button
            onClick={init}
            variant={"contained"}
            size="large"
            width={"100%"}
          >
            dsp
          </Button>
        </Box>
      )}

      <Tracks></Tracks>

      <Box>
        <Instrument instrument={selectedInstrument}></Instrument>
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
