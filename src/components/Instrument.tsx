import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  IconButton,
  TextField,
  Slider,
  Paper,
  Grid,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Parameter from "./Parameter.";

interface Props {
  instrument: any;
}

const Instrument = ({instrument}: Props) => {
    if(!instrument){return <></>}
  return (
    <Paper sx={{ padding: "24px" }}>
        <ul>
            {Object.entries(instrument?.parameters)?.map(([id, parameter]: any[])=>{
                return <li key={id}>{<Parameter parameter={parameter}></Parameter>}</li>
            })}
        </ul>
    </Paper>
  );
};

export default Instrument;
