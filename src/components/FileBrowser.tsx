import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  IconButton,
  TextField,
  Slider,
  Paper,
  Grid,
  List,
  ListItem,
} from "@mui/material";
import Parameter from "./Parameter.";
import Widget from "./Widget";
import { el } from "@elemaudio/core";
import useLiveSetStore from "../store/liveSet";

interface Props {
}

const FileBrowser = (props: Props) => {
    const files = useLiveSetStore(state => state.config.files)
  return (
    <Widget title="File Browser" size="large">
        {Object.entries(files).map(([key, path]: any, index: number)=>{
            return <Box key={index}>{key}</Box>
        })}
        {/* <pre>{JSON.stringify(files, null, 4)}</pre> */}
    </Widget>
  );
};

export default FileBrowser;
