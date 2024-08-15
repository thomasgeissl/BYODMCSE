import { useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import Keyboard from "./Keyboard";
import useLiveSetStore from "../store/liveSet";
import Tracks from "./Tracks";
import TrackDetails from "./TrackDetails";

function SoundCheck() {
  const initOrchestra = useLiveSetStore((state) => state.init);
  const listenToMidi = useLiveSetStore((state) => state.listenToMidi);
  const start = useLiveSetStore((state) => state.start);
  const render = useLiveSetStore((state) => state.render);
  const engine = useLiveSetStore((state) => state.engine);
  const tracks = useLiveSetStore((state) => state.tracks);
  const armedTracks = useLiveSetStore((state) => state.armedTracks);
  const selectedInstrumentId = useLiveSetStore(
    (state) => state.selectedInstrument
  );
  const loading = useLiveSetStore((state) => state.loading);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  useEffect(() => {
    initOrchestra();
    listenToMidi();
  }, [initOrchestra, listenToMidi]);

  const instruments = tracks.map((track) => track.instrument);
  const selectedInstrument = instruments.find(
    (instrument) => instrument.id === selectedInstrumentId
  );

  const handleKeyPressed = (note: number, velocity: number) => {
    if (engine) {
      tracks
        .filter((track) => armedTracks.includes(track.id))
        ?.map((i) => {
          engine.noteOn(i.midiChannel, note, velocity);
        });
      render();
    }
  };

  const handleKeyReleased = (note: number, velocity: number) => {
    if (engine) {
      tracks
        .filter((track) => armedTracks.includes(track.id))
        ?.map((i) => {
          engine.noteOff(i.midiChannel, note, velocity);
        });
      render();
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{ padding: "24px", width: "100%", height: "100%" }}
    >
      {!engine && (
        <Box sx={{ margin: "24px" }} display={"flex"}>
          <Button
            onClick={start}
            variant={"contained"}
            size="large"
            width={"100%"}
            disabled={loading}
          >
            {loading && <CircularProgress size={"12px"}></CircularProgress>} turn on the engine
          </Button>
        </Box>
      )}

      {engine && (
        <>
          <Box flex={1}>
            <Tracks></Tracks>
          </Box>
          <TrackDetails>
            <Keyboard
              onKeyPressed={handleKeyPressed}
              onKeyReleased={handleKeyReleased}
            />
          </TrackDetails>
        </>
      )}
    </Box>
  );
}

export default SoundCheck;
