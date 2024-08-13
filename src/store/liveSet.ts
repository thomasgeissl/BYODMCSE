import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import WebRenderer from "@elemaudio/web-renderer";
import config from "../assets/config.json";
import axios from "axios";
import { loadSample } from "../audio/utils";
import Engine from "../audio/Engine";

interface State {
  config: any;
  tracks: any[];
  armedTracks: string[];
  selectedInstrument: string | null;
  engine: any | null;
  init: (configUrl: string | null | undefined) => void;
  start: () => void;
  render: () => void;
  toggleArmedTrack: (id: string) => void;
  setSelectedInstrumentId: (id: string | null) => void;
  setParameterValue: (id: string, value: any) => void;
  getParameterValue: (instrumentId: string, parameterKey: string) => any | null;
}

let ctx: AudioContext;
const core = new WebRenderer();

const useLiveSetStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        config: null,
        tracks: [],
        armedTracks: [],
        selectedInstrument: null,
        engine: null,
        init: async (configUrl: string | null | undefined) => {
          if (configUrl) {
            const config = await axios.get(configUrl);
            const tracks = config.data.tracks;
            console.log("loading config from external url");
            set({ config, tracks });
          } else {
            console.log("loading config from internal json");
            set({ config, tracks: config.tracks});
          }
        },
        start: async () => {
          const config = get().config;
          const ctx = new window.AudioContext();
          if (ctx.state === "suspended") {
            await ctx.resume();
          }

          core.on("load", async () => {
            const files: any = {};
            const entries = Object.entries(config.files);
            for (let i = 0; i < entries.length; i++) {
              const [key, path] = entries[i];
              files[key] = await loadSample(path, ctx);
            }

            core.updateVirtualFileSystem(files);
            const engine = new Engine(config);
            set({ engine });
          });
          const node = await core.initialize(ctx, {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2],
          });
          node.connect(ctx.destination);
        },
        render(){
          const engine = get().engine
          const mainOut = engine?.render();
          core?.render(mainOut, mainOut);
        },
        toggleArmedTrack(id) {
          const { armedTracks } = get();
          if (armedTracks.includes(id)) {
            set({ armedTracks: armedTracks.filter((t) => t !== id) });
          } else {
            set({ armedTracks: [...armedTracks, id] });
          }
        },
        setSelectedInstrumentId(id) {
          set({ selectedInstrument: id });
        },
        setParameterValue(id, value) {
          const tracks = [...get().tracks];
          for (const track of tracks) {
            const keys = Object.keys(track?.instrument.parameters);
            keys.forEach((key) => {
              if (track?.instrument.parameters[key]?.id === id) {
                track.instrument.parameters[key].value = value;
              }
            });
          }
          set({ tracks });
        },
        getParameterValue(instrumentId, parameterKey) {
          const instruments = get()
            .tracks.map((track) => track.instrument)
            .filter((instrument) => instrument.id === instrumentId);
          if (instruments.length > 0) {
            return instruments[0].parameters[parameterKey].value;
          }
          return null;
        },
      }),
      {
        name: "liveSet",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => {
          return {};
        },
      }
    ),
    { name: "liveSet" }
  )
);

export default useLiveSetStore;
