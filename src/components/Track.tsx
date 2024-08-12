import { Box, ToggleButton } from "@mui/material";
import Instrument from "./Instrument";
import { FiberManualRecord, RecordVoiceOver } from "@mui/icons-material";
import useLiveSetStore from "../store/liveSet";

interface Props {
  track: any;
}
function Track({ track }: Props) {
  const armedTracks = useLiveSetStore((state) => state.armedTracks);
  const toggleArmedTrack = useLiveSetStore((state) => state.toggleArmedTrack);
  const setSelectedInstrument = useLiveSetStore(
    (state) => state.setSelectedInstrumentId
  );
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{ width: "200px" }}
      onClick={() => {
        setSelectedInstrument(track.instrument.id);
      }}
    >
      <Box>{track.name}</Box>
      <Box>ch: {track.midiChannel}</Box>
      <Box>inst: {track.instrument.type}</Box>
      <Box>
        <ToggleButton
          value={track.id}
          selected={armedTracks.includes(track.id)}
          onChange={() => {
            toggleArmedTrack(track.id);
          }}
        >
          <FiberManualRecord></FiberManualRecord>
        </ToggleButton>
      </Box>
      {/* <Instrument instrument={track.instrument}></Instrument> */}
      {/* <pre>{JSON.stringify(track, null, 4)}</pre> */}
    </Box>
  );
}

export default Track;
