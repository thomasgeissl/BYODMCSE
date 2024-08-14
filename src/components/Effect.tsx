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

interface Props {
  effect: any;
}

const Effect = ({ effect }: Props) => {
  if (!effect) {
    return <></>;
  }
  return (
    <Widget title={effect.name}>
      <List sx={{width: "100%"}}>
        {Object.entries(effect?.parameters)?.map(
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

export default Effect;
