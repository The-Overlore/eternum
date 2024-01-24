import { useEffect, useMemo, useState } from "react";
import Button from "../../../../elements/Button";
import NpcChat from "./NpcChat";
import useRealmStore from "../../../../hooks/store/useRealmStore";
import { getRealm } from "../../../../utils/realms";
import { ReactComponent as ArrowPrev } from "../../../../assets/icons/common/arrow-prev.svg";
import { ReactComponent as ArrowNext } from "../../../../assets/icons/common/arrow-next.svg";


type NpcPanelProps = {
  type?: "all" | "farmers" | "miners";
};

export const NpcPanel = ({ type = "all" }: NpcPanelProps) => {
  const [spawned, setSpawned] = useState(-1);
  const { realmEntityId } = useRealmStore();
  
  const [selectedTownhall, setSelectedTownhall] = useState<string | null>(null);

  const prevTownhall = () => {
    const chatIdentifier = `npc_chat_${realm?.realmId ?? BigInt(0)}`;
    const currEntry = localStorage.getItem(chatIdentifier);
    if (currEntry) {
      const currObj = JSON.parse(currEntry);
      const keys = Object.keys(currObj);
      const currentIndex = keys.indexOf(selectedTownhall);
      if (currentIndex > 0) {
        const prevKey = keys[currentIndex - 1];
        setSelectedTownhall(prevKey);
      }
    }
  };

  const nextTownhall = () => {
    const chatIdentifier = `npc_chat_${realm?.realmId ?? BigInt(0)}`;
    const currEntry = localStorage.getItem(chatIdentifier);
    if (currEntry) {
      const currObj = JSON.parse(currEntry);
      const keys = Object.keys(currObj);
      const currentIndex = keys.indexOf(selectedTownhall);
      if (currentIndex >= 0 && currentIndex < keys.length - 1) {
        const nextKey = keys[currentIndex + 1];
        setSelectedTownhall(nextKey);
      }
    };
  }

  const realm = useMemo(() => {
    return realmEntityId ? getRealm(realmEntityId) : undefined;
  }, [realmEntityId]);
  
  useEffect(() => {
    const chatIdentifier = `npc_chat_${realm?.realmId ?? BigInt(0)}`;
    const currEntry = localStorage.getItem(chatIdentifier);
    if (currEntry) {
      const currObj = JSON.parse(currEntry);
      const keys = Object.keys(currObj);
      if (keys.length > 0) {
        const lastKey = keys[keys.length - 1];
        setSelectedTownhall(lastKey);
      }
    }
  }, [realm?.realmId]);

  return (
    <div className="flex flex-col h-[250px] relative pb-3">
      <div
        className="flex flex-row w-[100%] items-center space-y-2"
        style={{ position: "relative", top: "2%" }}
      >
        <Button
          className="mx-1 top-3 left-3 w-32 bottom-2 !rounded-full"
          onClick={() => setSpawned(spawned + 1)}
          variant="primary"
        >
          Gather villagers
        </Button>

        <div className="flex">
          <Button
            className="mx-1  left-3 w-12  !rounded-md"
            onClick={prevTownhall} 
            variant="primary"
            >
            <ArrowPrev />
          </Button>
          <div className="text-white">{selectedTownhall}</div>
          <Button
            className="mx-1 top-3 left-3 w-12 bottom-2 !rounded-md"
            onClick={nextTownhall} 
            variant="primary"
            >
            <ArrowNext />
          </Button>
        </div>

      </div>
      <NpcChat spawned={spawned} realmId={realm?.realmId ?? BigInt(0)} selectedTownhall={selectedTownhall} setSelectedTownhall={setSelectedTownhall} />
    </div>
  );
};
