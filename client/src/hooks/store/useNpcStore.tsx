import { create } from "zustand";
import { Npc } from "../../components/cityview/realm/villagers/types";

const callLoreMachineJsonRpcMethod = async (method: string, params: any) => {
  const response = await fetch(import.meta.env.VITE_OVERLORE_RPC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: [params],
      id: 1,
    }),
  });
  const responseJson = await response.json();
  if ("error" in responseJson) throw responseJson.error;
  else return JSON.parse(responseJson.result);
};

interface NpcState {
  loreMachineJsonRpcCall: (method: string, params: any) => Promise<any>;
  isTownHallLoading: boolean;
  setIsTownHallLoading: (val: boolean) => void;
  selectedTownhall: number | null;
  setSelectedTownhall: (newIndex: number | null) => void;
  lastMessageDisplayedIndex: number;
  setLastMessageDisplayedIndex: (newIndex: number) => void;
  showNpcPopup: boolean;
  setShowNpcPopup: (val: boolean) => void;
  selectedNpc: Npc | null;
  setSelectedNpc: (val: Npc) => void;
}

const useNpcStore = create<NpcState>((set) => ({
  loreMachineJsonRpcCall: async (method: string, params: any): Promise<any> => {
    return await callLoreMachineJsonRpcMethod(method, params);
  },
  isTownHallLoading: false,
  setIsTownHallLoading: (val: boolean) => set({ isTownHallLoading: val }),
  selectedTownhall: null,
  setSelectedTownhall: (val: number | null) => set({ selectedTownhall: val }),
  lastMessageDisplayedIndex: 0,
  setLastMessageDisplayedIndex: (val: number) => set({ lastMessageDisplayedIndex: val }),
  showNpcPopup: false,
  setShowNpcPopup: (val: boolean) => set({ showNpcPopup: val }),
  selectedNpc: null,
  setSelectedNpc: (val: Npc) => set({ selectedNpc: val }),
}));

export default useNpcStore;
