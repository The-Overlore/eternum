import { useEffect, useMemo, useState } from "react";
import Button from "../../../../elements/Button";
import NpcChat from "./NpcChat";
import useRealmStore from "../../../../hooks/store/useRealmStore";
import { getRealm } from "../../../../utils/realms";
import { ReactComponent as ArrowPrev } from "../../../../assets/icons/common/arrow-left.svg";
import { ReactComponent as ArrowNext } from "../../../../assets/icons/common/arrow-right.svg";
import { useDojo } from "../../../../DojoContext";

type NpcPanelProps = {
  type?: "all" | "farmers" | "miners";
};

export const NpcPanel = ({ type = "all" }: NpcPanelProps) => {
  const {
    setup: {
      systemCalls: { spawn_npc },
    },
    account: { account },
  } = useDojo();
  const [townHallRequest, setTownHallRequest] = useState(-1);
  const [selectedTownhall, setSelectedTownhall] = useState<number | null>(null);
  const { realmId, realmEntityId } = useRealmStore();

  const parseTownhalls = (direction: string) => {
    const chatIdentifier = `npc_chat_${realm?.realmId ?? BigInt(0)}`;
    const townhallsInLocalStorage = localStorage.getItem(chatIdentifier);

    if (townhallsInLocalStorage && selectedTownhall !== null) {
      const townhallsAsObject = JSON.parse(townhallsInLocalStorage);
      const keys = Object.keys(townhallsAsObject);
      const currentKey = keys.indexOf(String(selectedTownhall));
      let newKey = keys[keys.indexOf(String(selectedTownhall))];

      if (direction == "previous" && currentKey > 0) {
        newKey = keys[currentKey - 1];
      } else if (direction == "next" && currentKey >= 0 && currentKey < keys.length - 1) {
        newKey = keys[currentKey + 1];
      }
      setSelectedTownhall(Number(newKey));
    }
  };

  const realm = useMemo(() => {
    return realmId ? getRealm(realmId) : undefined;
  }, [realmId]);

  const spawnNpc = async () => {
    let npcId = await spawn_npc({ signer: account, realm_id: realmEntityId });
  };

  useEffect(() => {
    const chatIdentifier = `npc_chat_${realm?.realmId ?? BigInt(0)}`;
    const townhallsInLocalStorage = localStorage.getItem(chatIdentifier);
    if (townhallsInLocalStorage) {
      const townhallsAsObject = JSON.parse(townhallsInLocalStorage);
      const keys = Object.keys(townhallsAsObject);
      if (keys.length > 0) {
        const lastKey = Number(keys[keys.length - 1]);
        setSelectedTownhall(lastKey);
      }
    }
  }, [realm?.realmId]);

  return (
    <div className="flex flex-col h-[250px] relative pb-3">
      <div
        className="flex flex-row w-[100%] items-center justify-between space-y-2"
        style={{ position: "relative", top: "2%" }}
      >
        {/* <Button className="mx-2 top-3 left-3 w-32 bottom-2 !rounded-full" onClick={spawnNpc} variant="primary">
          Spawn villager
        </Button> */}
        <Button
          className="mx-2 top-3 left-3 w-32 bottom-2 !rounded-full"
          onClick={() => setTownHallRequest(townHallRequest + 1)}
          variant="primary"
        >
          Gather villagers
        </Button>

        <div className="flex">
          <Button onClick={() => parseTownhalls("previous")}>
            <ArrowPrev />
          </Button>
          <div className="text-white">{selectedTownhall}</div>
          <Button onClick={() => parseTownhalls("next")} className="mr-2">
            <ArrowNext />
          </Button>
        </div>
      </div>
      <NpcChat
        townHallRequest={townHallRequest}
        order={realm?.order ?? 0}
        realmId={realm?.realmId ?? BigInt(0)}
        selectedTownhall={selectedTownhall}
        setSelectedTownhall={setSelectedTownhall}
      />
    </div>
  );
};
