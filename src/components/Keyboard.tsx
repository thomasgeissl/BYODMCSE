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
import Widget from "./Widget";

const keys = [
  { note: "C", color: "white", midi: 60, key: "a" },
  { note: "C#", color: "black", midi: 61, key: "w" },
  { note: "D", color: "white", midi: 62, key: "s" },
  { note: "D#", color: "black", midi: 63, key: "e" },
  { note: "E", color: "white", midi: 64, key: "d" },
  { note: "F", color: "white", midi: 65, key: "f" },
  { note: "F#", color: "black", midi: 66, key: "t" },
  { note: "G", color: "white", midi: 67, key: "g" },
  { note: "G#", color: "black", midi: 68, key: "z" },
  { note: "A", color: "white", midi: 69, key: "h" },
  { note: "A#", color: "black", midi: 70, key: "u" },
  { note: "B", color: "white", midi: 71, key: "j" },
  { note: "C", color: "white", midi: 72, key: "k" },
];

const whiteKeyWidth = 40;
const blackKeyWidth = 30;
const blackKeyOffset = whiteKeyWidth - blackKeyWidth / 2;

interface Props {
  onKeyPressed: (note: number, velocity: number) => void;
  onKeyReleased: (note: number, velocity: number) => void;
}

const MusicalKeyboard = ({ onKeyPressed, onKeyReleased }: Props) => {
  const [octave, setOctave] = useState(0);
  const [velocity, setVelocity] = useState(100);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const keyObj = keys.find((key) => key.key === event.key);
      if (keyObj && !pressedKeys.has(event.key)) {
        setPressedKeys((prev) => new Set(prev).add(event.key));
        handleKeyPress(keyObj.midi);
      }
    };

    const handleKeyUp = (event: any) => {
      const keyObj = keys.find((key) => key.key === event.key);
      if (keyObj) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.key);
          return newSet;
        });
        handleKeyRelease(keyObj.midi);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys]);

  const handleKeyPress = (note: number) => {
    if (onKeyPressed) {
      onKeyPressed(note + octave * 12, velocity);
    }
  };

  const handleKeyRelease = (note: number) => {
    if (onKeyReleased) {
      onKeyReleased(note + octave * 12, velocity);
    }
  };

  return (
    <Widget>
      <Box display="flex" flexDirection={"column"} gap={3}>
        <Box display="flex" gap={3} marginBottom={"12px"}>
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <IconButton onClick={() => setOctave(octave - 1)}>
                  <ChevronLeft></ChevronLeft>
                </IconButton>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  value={octave}
                  onChange={(event: any) =>
                    setOctave(Number(event.target.value))
                  }
                  inputProps={{ min: -2, max: 4, step: 1 }}
                />
              </Grid>
              <Grid item xs={3}>
                <IconButton onClick={() => setOctave(octave + 1)}>
                  <ChevronRight></ChevronRight>
                </IconButton>
              </Grid>
            </Grid>
          </Box>
          <Box flex={1}>
            <Grid container spacing={3} width={"100%"}>
              <Grid item xs={9}>
                <Slider
                  value={velocity}
                  onChange={(event: any) => setVelocity(event.target.value)}
                  min={0}
                  max={127}
                  step={1}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  type="number"
                  value={velocity}
                  onChange={(event: any) =>
                    setVelocity(Number(event.target.value))
                  }
                  inputProps={{ min: 0, max: 127, step: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          position="relative"
          height={150}
        >
          {keys.map((key, index) => {
            const isBlackKey = key.color === "black";
            const whiteKeyOffset =
              keys.slice(0, index).filter((k) => k.color === "white").length *
              whiteKeyWidth;

            const offset = isBlackKey
              ? whiteKeyOffset - blackKeyOffset
              : whiteKeyOffset;

            return (
              <Box
                key={index}
                sx={{
                  width: isBlackKey ? blackKeyWidth : whiteKeyWidth,
                  height: isBlackKey ? 100 : 150,
                  backgroundColor: key.color,
                  margin: "2px",
                  zIndex: isBlackKey ? 2 : 1,
                  position: "absolute",
                  left: offset,
                  top: 0,
                  cursor: "pointer",
                  border: "1px solid #000",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  color: isBlackKey ? "white" : "black",
                  fontSize: "12px",
                }}
                onMouseDown={() => handleKeyPress(key.midi)}
                onMouseUp={() => handleKeyRelease(key.midi)}
              >
                {key.note}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Widget>
  );
};

export default MusicalKeyboard;
