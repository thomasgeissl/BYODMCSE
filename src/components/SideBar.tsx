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
import { Inventory } from "@mui/icons-material";
import useAppStore from "../store/app";

interface Props {}

const SideBar = (props: Props) => {
    const showFileBrowser = useAppStore((state) => state.showFileBrowser);
  const toggleShowFileBrowser = useAppStore(
    (state) => state.toggleShowFileBrowser
  );
  return (
    <Paper sx={{ padding: "4px" }}>
      <Inventory onClick={() => toggleShowFileBrowser()} color={showFileBrowser ? "primary" : "secondary"}></Inventory>
    </Paper>
  );
};

export default SideBar;
