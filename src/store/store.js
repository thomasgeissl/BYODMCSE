import { v4 } from 'uuid'
import { create } from 'zustand'

const useStore = create((set) => ({
  uuid: v4(),
}))

export default useStore