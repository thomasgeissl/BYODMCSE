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
import Effect from "./Effect";

interface Props {
  instrument: any;
}

const Instrument = ({ instrument }: Props) => {
  if (!instrument) {
    return <></>;
  }
  return (
    <Widget title={instrument.name}>
      <List sx={{width: "100%"}}>
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
    </Widget>
  );
};

export default Instrument;
