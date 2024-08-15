import { useEffect, useState } from "react";
import { Box, Button, Paper, ToggleButton, Typography } from "@mui/material";
import WebRenderer from "@elemaudio/web-renderer";
import Engine from "../audio/Engine";
import staticConfig from "../assets/config.json";
import { useSearchParams } from "react-router-dom";
import { loadSample } from "../audio/utils";
import Keyboard from "./Keyboard";
import axios from "axios";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Instrument from "./Instrument";
import useLiveSetStore from "../store/liveSet";
import Track from "./Track";

function Tracks() {
  const tracks = useLiveSetStore((state) => state.tracks);
  return (
    <Box display={"flex"} flexDirection={"row"} sx={{marginBottom: "24px"}} gap={2}>
      {tracks.map((track, index) => {
        return <Track key={`track-${index}`} track={track}></Track>;
      })}
    </Box>
  );
}

export default Tracks;
