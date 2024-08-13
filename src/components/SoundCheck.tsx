import { useEffect } from "react";
import { Box, Button } from "@mui/material";
import Keyboard from "./Keyboard";
import Instrument from "./Instrument";
import useLiveSetStore from "../store/liveSet";
import Tracks from "./Tracks";

function SoundCheck() {
  const initOrchestra = useLiveSetStore(state => state.init)
  const start = useLiveSetStore(state => state.start)
  const render = useLiveSetStore(state => state.render)
  const engine = useLiveSetStore(state => state.engine)
  const tracks = useLiveSetStore(state => state.tracks)
  const armedTracks = useLiveSetStore(state => state.armedTracks)
  const selectedInstrumentId = useLiveSetStore(state => state.selectedInstrument)
  useEffect(()=>{
    initOrchestra()
  }, [])

  const instruments = tracks.map(track => track.instrument)
  const selectedInstrument = instruments.find(instrument => instrument.id === selectedInstrumentId)

  const handleKeyPressed = (note: number, velocity: number) => {
    if (engine) {
      tracks.filter(track => armedTracks.includes(track.id))?.map((i) => {
        engine.noteOn(i.midiChannel, note, velocity);
      });
      render()
    }
  };

  const handleKeyReleased = (note: number, velocity: number) => {
    if (engine) {
      tracks.filter(track => armedTracks.includes(track.id))?.map((i) => {
        engine.noteOff(i.midiChannel, note, velocity);
      });
      render()
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"} sx={{ padding: "24px" }}>
      {!engine && (
        <Box sx={{ margin: "24px" }} display={"flex"}>
          <Button
            onClick={start}
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
