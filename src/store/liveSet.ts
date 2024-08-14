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
  selectedTrackId: string | null;
  init: () => void;
  start: () => void;
  render: () => void;
  toggleArmedTrack: (id: string) => void;
  setSelectedInstrumentId: (id: string | null) => void;
  setParameterValue: (id: string, value: any) => void;
  getParameterValue: (deviceId: string, parameterKey: string) => any;
  subscribeToMqtt: (roomId: string) => void;
  setSelectedTrackId: (trackId: string | null) => void;
  listenToMidi: () => void;
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
        selectedTrackId: null,
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
            for (const effect of track.effects) {
              const keys = Object.keys(effect.parameters);
              keys.forEach((key) => {
                if (effect.parameters[key]?.id === id) {
                  effect.parameters[key].value = value;
                }
              });
            }
          }
          set({ tracks });
        },
        getParameterValue(deviceId: string, parameterKey: string) {
          const instruments = get().tracks.map(
            (track: any) => track.instrument
          );

          const effects = get()
            .tracks.map((track: any) => track.effects)
            .flat();

          const devices = [...instruments, ...effects].filter(
            (device: any) => device.id === deviceId
          );
          if (devices.length > 0) {
            return devices[0].parameters[parameterKey].value;
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
                    console.log("got note on");
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
              render();
            } catch (error) {
              console.log("error", error);
            }
          });
        },
        setSelectedTrackId: (selectedTrackId: string | null) => {
          set({ selectedTrackId });
        },
        listenToMidi: async () => {
          if (await navigator.requestMIDIAccess()) {
            WebMidi.enable()
              .then(() => {
                console.log("WebMidi enabled!");
                onEnabled();
              })
              .catch((err) => alert(err));
          }

          function onEnabled() {
            // Inputs
            WebMidi.inputs.forEach((input) => {
              console.log(input.name);
              input.channels.forEach((channel, index) => {
                channel.addListener("noteon", (e) => {
                  const engine = get().engine;
                  const render = get().render;
                  engine.noteOn(channel.number, e.note.number, e.data[2]);
                  if (engine) {
                    render();
                  }
                });
                channel.addListener("noteoff", (e) => {
                  const engine = get().engine;
                  const render = get().render;
                  engine.noteOff(channel.number, e.note.number);
                  if (engine) {
                    render();
                  }
                });
                channel.addListener("controlchange", (e) => {
                  const engine = get().engine;
                  const render = get().render;
                  // const control = e.controller.number;
                  // const value = e.value;
                  // const destination = mappings[control];
                  // if (destination) {
                  //   const matchedInstruments = [
                  //     ...Object.values(engine.channels).filter(
                  //       (channel) => channel?.instrument?.id === destination.device
                  //     ),
                  //   ].map((channel) => channel.instrument);
                  //   let effects = [];
                  //   Object.values(engine.channels).forEach((channel) => {
                  //     effects = effects.concat(channel.effects);
                  //   });
                  //   const matchedEffects = effects.filter(
                  //     (effect) => effect.id === destination.device
                  //   );
                  //   [...matchedInstruments, ...matchedEffects].forEach((device) => {
                  //     if (device.setParameter) {
                  //       device.setParameter(
                  //         destination.parameter,
                  //         map(value, 0, 1, destination.min, destination.max)
                  //       );
                  //     }
                  //   });
                  // }
                  // if (engine) {
                  //   render();
                  // }
                });
              });
            });

            // Outputs
            // WebMidi.outputs.forEach((output) => console.log(output.name));
          }
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
