import { Box, ToggleButton } from "@mui/material";
import { FiberManualRecord, RecordVoiceOver } from "@mui/icons-material";
import useLiveSetStore from "../store/liveSet";
import Widget from "./Widget";

interface Props {
  track: any;
}

function Track({ track }: Props) {
  const armedTracks = useLiveSetStore((state) => state.armedTracks);
  const toggleArmedTrack = useLiveSetStore((state) => state.toggleArmedTrack);
  const setSelectedTrackId = useLiveSetStore(
    (state) => state.setSelectedTrackId
  );
  return (
    <Widget title={track.name} size="small">
      <Box
        display={"flex"}
        flexDirection={"column"}
        sx={{ width: "100%",}}
        onClick={() => {
          setSelectedTrackId(track.id);
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
            <FiberManualRecord
              color={armedTracks.includes(track.id) ? "primary" : "default"}
            ></FiberManualRecord>
          </ToggleButton>
        </Box>
      </Box>
    </Widget>
  );
}

export default Track;
