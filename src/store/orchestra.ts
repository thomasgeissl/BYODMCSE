import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import config from "../assets/config.json";
import axios from "axios";

interface State {
  tracks: any[];
  init: (configUrl: string | null) => void;
}

const useOrchestraStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        tracks: [],
        init: async (configUrl: string|null) => {
            if(configUrl){
                const response = await axios.get(configUrl);
                const tracks = response.data.tracks;
                console.log("loading config from external url")
                set({ tracks });
            }else{
                console.log("loading config from internal json")
                set({ tracks: config.tracks });
            }
            console.log(config)
        },
      }),
      {
        name: "orchestra",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => {
          return {};
        },
      }
    ),
    { name: "orchestra" }
  )
);

export default useOrchestraStore;
