import { v4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { union } from "lodash";

interface State {
  uuid: string;
  users: any[];
  showFileBrowser: boolean;
  addUser: (uuid: string) => void;
  removeUser: (uuid: string) => void;
  toggleShowFileBrowser: () => void;
}

const useAppStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        uuid: v4(),
        users: [],
        showFileBrowser: false,
        // Add a new user to the list of users
        addUser: (uuid: string) => {
          const users = get().users
          if (!get().users.find((u: any) => u.uuid === uuid)) {
            return set({
              users: [users, { uuid, timestamp: new Date() }],
            });
          }
        },
        removeUser: (uuid: string) => {
          const users = get().users
          set({
            users: users.filter((item:any) => item.uuid !== uuid),
          });
        },
        toggleShowFileBrowser: ()=>{
          set({showFileBrowser: !get().showFileBrowser})
        }
      }),
      {
        name: "app",
        storage: createJSONStorage(() => localStorage),
        partialize: (state: any) => {
          return {};
        },
      }
    ),
    { name: "app" }
  )
);

export default useAppStore;
