import { v4 } from "uuid";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { union } from "lodash";

const useStore = create(
  devtools((set, get) => ({
    uuid: v4(),
    users: [],
    addUser: (uuid) => {
      if (!get().users.find((u) => u.uuid === uuid)) {
        return set((state) => ({
          users: [...state.users, { uuid, timestamp: new Date() }],
        }));
      }
    },
    removeUser: (uuid) =>
      set((state) => ({
        users: state.users.filter((item) => item.uuid !== uuid),
      })),
  }))
);

export default useStore;
