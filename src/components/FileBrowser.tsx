import React, { useCallback, useEffect, useState } from "react";
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
  useTheme,
  Tooltip,
} from "@mui/material";
import Parameter from "./Parameter.";
import Widget from "./Widget";
import { el } from "@elemaudio/core";
import useLiveSetStore from "../store/liveSet";
import { useDropzone } from "react-dropzone";

interface Props {}

const FileBrowser = (props: Props) => {
    const theme = useTheme()
  const files = useLiveSetStore((state) => state.config.files);
  const onDrop = useCallback((acceptedFiles: any[]) => {
    console.log(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Widget title="File Browser" size="large">
      <Box {...getRootProps()} textAlign={"center"} sx={{padding: "24px", border: `1px dashed ${theme.palette.primary.main}`}}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </Box>
      {Object.entries(files).map(([key, path]: any, index: number) => {
        return <Box key={index}><Tooltip title={path}><span>{key}</span></Tooltip></Box>;
      })}
      {/* <pre>{JSON.stringify(files, null, 4)}</pre> */}
    </Widget>
  );
};

export default FileBrowser;
