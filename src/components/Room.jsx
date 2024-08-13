import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import WebRenderer from "@elemaudio/web-renderer";
import NoSleep from "nosleep.js";
import Engine from "../audio/Engine";
import Button from "@mui/material/Button";
import Stage from "./Stage";
import staticConfig from "../assets/config.json";

import LoopIcon from "@mui/icons-material/Loop";
import axios from "axios";
import { Box } from "@mui/material";
import { loadSample } from "../audio/utils";
let ctx;

const core = new WebRenderer();
const noSleep = new NoSleep();
let config = staticConfig;


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
  const roomId = useParams().roomId || "taxi";
  const [searchParams] = useSearchParams();
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orchestra, setOrchestra] = useState(null);
  console.log(roomId)

  useEffect(() => {
    if (searchParams.get("config")) {
      const configPath = searchParams.get("config");
      axios.get(configPath).then((response) => {
        try {
          config = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing config:", error);
        }
      });
    }
  }, [searchParams]);

  const init = async () => {
    setLoading(true);
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    core.on("meter", (e) => {
      if (e.source === "left") {
        console.log("left peak", e.max);
      }
      if (e.source === "right") {
        console.log("right peak", e.max);
      }
    });

    core.on("load", async () => {
      const files = {};
      const entries = Object.entries(config.files);
      for (let i = 0; i < entries.length; i++) {
        const [key, path] = entries[i];
        files[key] = await loadSample(path, ctx);
      }

      core.updateVirtualFileSystem(files);
      const orchestra = new Engine(config.orchestra);
      setOrchestra(orchestra);
      setLoading(false);
      setInited(true);
    });

    const node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);
    noSleep.enable();
  };

  return (
    <Box flex={1}>
      {!inited && (
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
      {inited && (
        <Stage core={core} orchestra={orchestra} mappings={config.mappings} />
      )}
    </Box>
  );
}

export default Room;
