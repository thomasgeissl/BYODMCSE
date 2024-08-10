import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  IconButton,
  TextField,
  Slider,
  Paper,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

interface Props {
  parameter: any;
}

const Parameter = ({parameter}: Props) => {
  const {value, options} = parameter
  if(typeof value === "number"){
    return <Slider value={value} min={options?.min || 0} max={options?.max || 1} />
  }
  if(typeof value === "string" && Array.isArray(options)){
    return <Select value={value}>
      {options?.map((option: any, index: number) => (
        <MenuItem key={index} value={option}>{option}</MenuItem>
      ))}
    </Select>
  }
  return (
        <pre>{JSON.stringify(parameter, null, 4)}</pre>
  );
};

export default Parameter;
