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

interface Props {
  instrument: any;
}

const Instrument = ({ instrument }: Props) => {
  if (!instrument) {
    return <></>;
  }
  return (
    <Paper sx={{ padding: "24px" }}>
      <List>
        {Object.entries(instrument?.parameters)?.map(
          ([id, parameter]: any[]) => {
            return (
              <ListItem key={id}>
                {<Parameter parameter={parameter}></Parameter>}
              </ListItem>
            );
          }
        )}
      </List>
    </Paper>
  );
};

export default Instrument;
