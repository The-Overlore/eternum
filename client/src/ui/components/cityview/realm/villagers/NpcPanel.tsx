import { useEffect, useMemo, useState } from "react";
import Button from "../../../../../../elements/Button";
import NpcChat from "./NpcChat";
import useRealmStore from "../../../../../../hooks/store/useRealmStore";
import { ReactComponent as ArrowPrev } from "../../../../../../assets/icons/common/arrow-left.svg";
import { ReactComponent as ArrowNext } from "../../../../../../assets/icons/common/arrow-right.svg";
import { StorageTownhalls, TownhallResponse, StorageTownhall } from "../../types";
import { getRealm } from "../../../../../../utils/realms";
import { keysSnakeToCamel } from "../../utils";
import TextInput from "../../../../../../elements/TextInput";
import { MAX_TOWNHALL_INPUT_LENGTH } from "../../constants";
import useNpcStore from "../../../../../../hooks/store/useNpcStore";

type TownhallPanelProps = {
  type?: "all" | "farmers" | "miners";
};

export const TownhallPanel = ({ type = "all" }: TownhallPanelProps) => {
  const { realmId, realmEntityId } = useRealmStore();
  const [townhallInput, setTownhallInput] = useState("");

  const LOCAL_STORAGE_ID: string = `npc_chat_${realmId}`;

  const realm = useMemo(() => {
    return realmEntityId ? getRealm(realmId!) : undefined;
  }, [realmEntityId]);

  const {
    loreMachineJsonRpcCall,
    isTownHallLoading,
    setIsTownHallLoading,
    selectedTownhall,
    setSelectedTownhall,
    setLastMessageDisplayedIndex,
  } = useNpcStore();

  const setSelectedTownhallFromDirection = (direction: number) => {
    const newKey = getNewTownhallKeyFromDirection(selectedTownhall, direction, LOCAL_STORAGE_ID);

    if (newKey == -1) {
      return;
    }

    setLastMessageDisplayedIndex(0);
    setSelectedTownhall(newKey);
  };

  const treatTownhallResponse = (response: TownhallResponse) => {
    setLastMessageDisplayedIndex(0);
    const townhallKey = addTownHallToStorage(response, LOCAL_STORAGE_ID);
    setSelectedTownhall(townhallKey);
    setIsTownHallLoading(false);
  };

  const gatherVillagers = async () => {
    setIsTownHallLoading(true);
    try {
      let response = await loreMachineJsonRpcCall("generateDiscussion", {
        realm_id: Number(realmId!),
        realm_entity_id: Number(realmEntityId!),
        order_id: realm!.order,
        user_input: townhallInput,
      });
      response = keysSnakeToCamel(response);
      treatTownhallResponse(response as TownhallResponse);
    } catch (e) {
      console.log(e);
    }
    setIsTownHallLoading(false);
  };

  useEffect(() => {
    const lastKey = getLastStorageTownhallKey(LOCAL_STORAGE_ID);
    if (lastKey == -1) {
      setSelectedTownhall(null);
      return;
    }
    setSelectedTownhall(lastKey);
  }, [realmId]);

  const handleUserMessageChange = (inputValue: string) => {
    if (inputValue.length <= MAX_TOWNHALL_INPUT_LENGTH) {
      setTownhallInput(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[250px] relative pb-3">
      <div className="flex flex-row w-[100%] items-center justify-between" style={{ position: "relative", top: "2%" }}>
        <div className="flex relative">
          <Button onClick={() => setSelectedTownhallFromDirection(-1)}>
            <ArrowPrev />
          </Button>
          <div className="text-white">{selectedTownhall}</div>
          <Button onClick={() => setSelectedTownhallFromDirection(+1)} className="mr-2">
            <ArrowNext />
          </Button>
        </div>
      </div>
      <NpcChat />

      <div className="flex my-2">
        <TextInput placeholder="Write something..." value={townhallInput} onChange={handleUserMessageChange} />
        <Button
          className="mx-2 w-32 bottom-2 !rounded-full"
          onClick={gatherVillagers}
          variant={isTownHallLoading ? "default" : "primary"}
        >
          Ring the town bell
        </Button>
      </div>
    </div>
  );
};

const getNewTownhallKeyFromDirection = (
  selectedTownhall: number | null,
  direction: number,
  localStorageId: string,
): number => {
  if (selectedTownhall === null) {
    return -1;
  }

  const storedTownhalls: StorageTownhalls = JSON.parse(localStorage.getItem(localStorageId) ?? "{}");

  const keys = Object.keys(storedTownhalls).map((val) => Number(val));

  const currentKey = keys.indexOf(selectedTownhall);
  let newKey = keys[currentKey];

  if (currentKey + direction >= keys.length || currentKey + direction < 0) {
    return -1;
  }
  newKey = keys[currentKey + direction];
  return newKey;
};

const getLastStorageTownhallKey = (localStorageId: string): number => {
  const storageTownhalls: StorageTownhalls = JSON.parse(localStorage.getItem(localStorageId) ?? "{}");
  const keys = Object.keys(storageTownhalls).map((val) => Number(val));
  if (keys.length <= 0) {
    return -1;
  }
  const lastKey = keys[keys.length - 1];
  return lastKey;
};

const addTownHallToStorage = (message: TownhallResponse, localStorageId: string): number => {
  const townhallKey = message.townhallId;

  const newEntry: StorageTownhall = {
    viewed: false,
    dialogue: message.dialogue,
  };

  const townhallsInLocalStorage = localStorage.getItem(localStorageId);
  const storedTownhalls: StorageTownhalls = JSON.parse(townhallsInLocalStorage ?? "{}");
  storedTownhalls[townhallKey] = newEntry;
  localStorage.setItem(localStorageId, JSON.stringify(storedTownhalls));

  return townhallKey;
};
