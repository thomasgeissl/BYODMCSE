import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import WebRenderer from "@elemaudio/web-renderer";
import { WebMidi } from "webmidi";
import mqtt from "mqtt";
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
  loading: boolean;
  init: () => void;
  start: () => void;
  render: () => void;
  toggleArmedTrack: (id: string) => void;
  setSelectedInstrumentId: (id: string | null) => void;
  setParameterValue: (id: string, value: any) => void;
  getParameterValue: (instrumentId: string, parameterKey: string) => any;
  subscribeToMqtt: (roomId: string) => void;
}

let ctx: AudioContext;
const core = new WebRenderer();
let mqttClient: any;

const useLiveSetStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        config: null,
        tracks: [],
        armedTracks: [],
        selectedInstrument: null,
        engine: null,
        loading: false,
        init: async () => {
          set({ loading: true });
          let params = new URLSearchParams(document.location.search);
          let configUrl = params.get("config"); // is the string "Jonathan"
          if (configUrl) {
            const config = await axios.get(configUrl);
            const tracks = config.data.tracks;
            console.log("loading config from external url");
            set({ config, tracks });
          } else {
            console.log("loading config from internal json");
            set({ config, tracks: config.tracks });
          }
          set({ loading: false });
        },
        start: async () => {
          set({ loading: false });
          const config = get().config;
          ctx = new window.AudioContext();
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
            set({ engine, loading: false });
          });
          const node = await core.initialize(ctx, {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2],
          });
          node.connect(ctx.destination);
        },
        render() {
          const engine = get().engine;
          const mainOut = engine?.render();
          core?.render(mainOut, mainOut);
        },
        toggleArmedTrack(id: string) {
          const { armedTracks } = get();
          if (armedTracks.includes(id)) {
            set({ armedTracks: armedTracks.filter((t: any) => t !== id) });
          } else {
            set({ armedTracks: [...armedTracks, id] });
          }
        },
        setSelectedInstrumentId(id: string) {
          set({ selectedInstrument: id });
        },
        setParameterValue(id: string, value: any) {
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
        getParameterValue(instrumentId: string, parameterKey: string) {
          const instruments = get()
            .tracks.map((track: any) => track.instrument)
            .filter((instrument: any) => instrument.id === instrumentId);
          if (instruments.length > 0) {
            return instruments[0].parameters[parameterKey].value;
          }
          return null;
        },
        subscribeToMqtt(roomId: string) {
          mqttClient = mqtt.connect(config.connection.broker);
          mqttClient.on("connect", function () {
            mqttClient.subscribe(`byod/${roomId}`, function (err: any) {
              if (err) {
                console.error(err);
              }
            });
          });

          mqttClient.on("message", function (topic: string, message: any) {
            const engine = get().engine;
            const render = get().render;
            try {
              const payload = JSON.parse(message.toString());
              switch (topic) {
                case `byod/${roomId}`: {
                  if (payload.status === 176) {
                    //CC
                    const { channel, control, value } = payload;
                    // const destination = mappings[control];
                    // if (destination) {
                    // TODO: get device from orchestra, get parameter from device and map value and finally set
                    // console.log(destination.device, destination.parameter);
                    // }
                  }
                  if (payload.status === 144) {
                    console.log("got note on")
                    engine?.noteOn(
                      payload.channel,
                      payload.note,
                      payload.velocity
                    );
                  } else if (payload.status === 128) {
                    engine?.noteOff(payload.channel, payload.note);
                  }
                  break;
                }
              }
              render()
            } catch (error) {
              console.log("error", error);
            }
          });
        },
      }),
      {
        name: "liveSet",
        storage: createJSONStorage(() => localStorage),
        partialize: (state: any) => {
          return {};
        },
      }
    ),
    { name: "liveSet" }
  )
);

export default useLiveSetStore;
export { core };
