import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import WebRenderer from "@elemaudio/web-renderer";
import { el } from "@elemaudio/core";
import NoSleep from "nosleep.js";
import Orchestra from "../audio/Orchestra";
import Button from "@mui/material/Button";
import Stage from "./Stage";
import staticConfig from "../assets/config.json";

import LoopIcon from "@mui/icons-material/Loop";
import axios from "axios";
let ctx;

const core = new WebRenderer();
const noSleep = new NoSleep();
let config = staticConfig

const loadSample = async (path, ctx) => {
  const res = await fetch(path);
  const sampleBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
  return sampleBuffer.getChannelData(0);
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* padding: 16px; */
`;
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
  if (searchParams.get("config")) {
    const configPath = searchParams.get("config");
    axios.get(configPath).then((response) => {
      console.log(response.data);
      try {
        config = JSON.parse(response.data)
      } catch (error) {
        
      }
      // TODO: should tis be done async?
      // TODO: set config and load orchestra
    });
  }

  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orchestra, setOrchestra] = useState(null);
  if (inited && ctx.state !== "running") {
    console.log("ctx.state", ctx.state);
    ctx.resume();
  }

  const init = async () => {
    setLoading(true);
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    core.on("meter", function (e) {
      if (e.source === "left") {
        console.log("left peak", e.max);
        // handleLeftPeakValue(e.max);
      }
      if (e.source === "right") {
        console.log("right peak", e.max);
        // handleRightPeakValue(e.max);
      }
    });

    core.on("load", async function () {
      const files = {};
      const entries = Object.entries(config.files);
      for (let i = 0; i < entries.length; i++) {
        const [key, path] = entries[i];
        files[key] = await loadSample(path, ctx);
      }

      core.updateVirtualFileSystem(files);
      // core.render(el.cycle(440), el.cycle(440));
      const orchestra = new Orchestra(config.orchestra);
      setOrchestra(orchestra);
      setLoading(false);
      setInited(true);
    });
    // if (ctx.state !== "running") {
    //   await ctx.resume();
    // }
    const node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);
    noSleep.enable();
  };

  return (
    <Container>
      {!inited && (
        <>
          <Instructions>
            please increase your volume to the max and enter the room
          </Instructions>
          <Button
            onClick={() => {
              // setTimeout(() => {
              init();
              // }, 200);
            }}
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
            enter
          </Button>
        </>
      )}
      {inited && (
        <Stage
          core={core}
          orchestra={orchestra}
          mappings={config.mappings}
        ></Stage>
      )}
    </Container>
  );
}

export default Room;
