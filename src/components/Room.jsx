import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import NoSleep from "nosleep.js";
import Button from "@mui/material/Button";
import Stage from "./Stage";

import LoopIcon from "@mui/icons-material/Loop";
import { Box } from "@mui/material";
import useLiveSetStore from "../store/liveSet";

const noSleep = new NoSleep();

const Instructions = styled.div`
  flex-grow: 1;
  display: flex;
  text-align: center;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  font-size: 24px;
`;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Room() {
  const roomId = useParams().roomId || "";
  const engine = useLiveSetStore((state) => state.engine);
  const initOrchestra = useLiveSetStore((state) => state.init);
  const start = useLiveSetStore((state) => state.start);
  const loading = useLiveSetStore((state) => state.loading);

  useEffect(() => {
    initOrchestra();
  }, []);

  const init = () => {
    start();
    noSleep.enable();
  };

  return (
    <Box flex={1}>
      {!engine && (
        <>
          <Instructions>
            Please increase your volume to the max and enter the room
          </Instructions>
          <Button
            onClick={init}
            variant={"outlined"}
            size="large"
            sx={{
              marginBottom: "128px !important",
              height: "128px",
              width: "75%",
              margin: "auto",
            }}
            disabled={loading}
          >
            {loading && (
              <LoopIcon
                sx={{
                  marginRight: "16px",
                  animation: "spin 2s linear infinite",
                  "@keyframes spin": {
                    "0%": {
                      transform: "rotate(360deg)",
                    },
                    "100%": {
                      transform: "rotate(0deg)",
                    },
                  },
                }}
              />
            )}
            Enter
          </Button>
        </>
      )}
      {engine && <Stage />}
    </Box>
  );
}

export default Room;
