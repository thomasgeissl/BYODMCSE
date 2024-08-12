import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import config from "../assets/config.json";
import axios from "axios";

interface State {
  tracks: any[];
  armedTracks: string[];
  selectedInstrument: string | null;
  init: (configUrl: string | null | undefined) => void;
  toggleArmedTrack: (id: string) => void;
  setSelectedInstrumentId: (id: string | null) => void;
  setParameterValue: (id: string, value: any) => void;
  getParameterValue: (instrumentId: string, parameterKey: string) => any | null;
}

const useLiveSetStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        tracks: [],
        armedTracks: [],
        selectedInstrument: null,
        init: async (configUrl: string | null | undefined) => {
          if (configUrl) {
            const response = await axios.get(configUrl);
            const tracks = response.data.tracks;
            console.log("loading config from external url");
            set({ tracks });
          } else {
            console.log("loading config from internal json");
            set({ tracks: config.tracks });
          }
          console.log(config);
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
            return instruments[0].parameters[parameterKey];
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
