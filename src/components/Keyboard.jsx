import React, { useEffect, useState} from "react";
import { Box, Container, Typography } from "@mui/material";

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

const MusicalKeyboard = ({ onKeyPressed, onKeyReleased }) => {
    const [octave, setOctave] = useState(0)
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyObj = keys.find((key) => key.key === event.key);
      if (keyObj) {
        handleKeyPress(keyObj.midi);
      }
    };

    const handleKeyUp = (event) => {
      const keyObj = keys.find((key) => key.key === event.key);
      if (keyObj) {
        handleKeyRelease(keyObj.midi);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleKeyPress = (midi) => {
    if (onKeyPressed) {
      onKeyPressed(midi + octave * 12);
    }
  };

  const handleKeyRelease = (midi) => {
    if (onKeyReleased) {
      onKeyReleased(midi + octave*12);
    }
  };

  return (
    <Container>
        <Box display="flex" marginBottom={10}>
          <Box display={"flex"} gap={1}>
            <button onClick={() => setOctave(octave - 1)}>{"<"}</button>
            <span>{octave}</span>
            <button onClick={() => setOctave(octave + 1)}>{">"}</button>
          </Box>
        </Box>
      <Box display="flex" alignItems="center" position="relative" height={150}>
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
    </Container>
  );
};

export default MusicalKeyboard;
