import { useMemo, useState } from "react";
import { getComponentValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { BigNumberish, shortString } from "starknet";
import { SortPanel } from "../../../../../../elements/SortPanel";
import { SortButton, SortInterface } from "../../../../../../elements/SortButton";
import { getNpcHeadline, sortVillagers, READY_TO_SPAWN } from "./VillagersUtils";
import {
  NPC_CONFIG_ID,
  keysSnakeToCamel,
  packCharacteristics,
  useAtGatesNpcs,
  useResidentsNpcs,
  useTravelersNpcs,
} from "../../utils";
import { ReactComponent as Plus } from "../../../../../../../assets/icons/npc/plus.svg";
import { NpcSortButton } from "../../NpcSortButton";
import { SortVillagers } from "../../types";
import { formatSecondsLeftInDaysHours } from "../../../labor/laborUtils";
import { VillagerComponent } from "../../VillagerComponent";
import { useDojo } from "@/hooks/context/DojoContext";
import useRealmStore from "@/hooks/store/useRealmStore";
import useBlockchainStore from "@/hooks/store/useBlockchainStore";
import useNpcStore from "@/hooks/store/useNpcStore";

export const VillagersPanel = () => {
  const {
    setup: {
      components: { LastSpawned, NpcConfig, RealmRegistry, Npc: NpcComponent, EntityOwner, ArrivalTime, Position },
      systemCalls: { spawn_npc },
    },
    account: { account },
  } = useDojo();

  const { realmId, realmEntityId } = useRealmStore();
  const { nextBlockTimestamp } = useBlockchainStore();

  const { loreMachineJsonRpcCall } = useNpcStore();

  const villagers: SortVillagers = {
    residents: useResidentsNpcs(realmEntityId, NpcComponent, EntityOwner),
    travelers: useTravelersNpcs(realmId!, realmEntityId, NpcComponent, EntityOwner, Position),
    atGates: useAtGatesNpcs(
      realmId!,
      realmEntityId!,
      nextBlockTimestamp!,
      NpcComponent,
      Position,
      ArrivalTime,
      EntityOwner,
    ),
  };

  const [npcIsSpawning, setNpcIsSpawning] = useState(false);

  const [displayedNpcGroup, setDisplayedNpcGroup] = useState("None");
  const [sortedByParam, setSortedByParam] = useState<SortInterface>({
    sortKey: "number",
    sort: "none",
  });

  const npcGroupSortingParams = useMemo(() => {
    return [
      { label: "residents", className: "mr-4" },
      { label: "travelers", className: "mr-4" },
      { label: "atGates", className: "" },
    ];
  }, []);

  const sortingParams = useMemo(() => {
    return [
      { label: "Name", sortKey: "fullName", className: "mr-4" },
      { label: "Role", sortKey: "role", className: "mr-4" },
      { label: "Age", sortKey: "age", className: "mr-4" },
      { label: "Gender", sortKey: "sex", className: "mr-4" },
    ];
  }, []);

  const spawnNpc = async () => {
    const lastSpawnTs = getLastSpawnTs();

    if (lastSpawnTs !== READY_TO_SPAWN) {
      console.log("Can't spawn: spawn delay has not passed yet");
      return;
    }

    if (isRealmFull()) {
      console.log("Can't spawn: too many NPCs");
      return;
    }
    try {
      setNpcIsSpawning(true);
      let response = await loreMachineJsonRpcCall("spawnNpc", {
        realm_entity_id: Number(realmEntityId),
      });
      response = keysSnakeToCamel(response);
      await spawn_npc({
        signer: account,
        realm_entity_id: realmEntityId,
        characteristics: packCharacteristics(response.npc.characteristics),
        character_trait: shortString.encodeShortString(response.npc.characterTrait),
        full_name: shortString.encodeShortString(response.npc.fullName),
        signature: response.signature as BigNumberish[],
      });
    } catch (e) {
      console.log(e);
    } finally {
      setNpcIsSpawning(false);
    }
  };

  const getSpawnInfo = () => {
    const lastSpawnTs = getLastSpawnTs();

    if (lastSpawnTs === READY_TO_SPAWN) {
      return (
        <>
          <p>Ready to spawn</p>
          <Plus style={{ backgroundColor: "#E0AF65" }} onClick={spawnNpc} className="ml-2 rounded-sm h-4" />
        </>
      );
    }
    return (
      <>
        <p>Spawn available in: </p>
        <div className="ml-1 text-gold">{formatSecondsLeftInDaysHours(lastSpawnTs)}</div>
        <Plus onClick={spawnNpc} className="ml-2 rounded-sm bg-dark h-4" />
      </>
    );
  };

  const getLastSpawnTs = (): number => {
    const npcConfig = getComponentValue(NpcConfig, getEntityIdFromKeys([NPC_CONFIG_ID]));
    const last_spawned = getComponentValue(LastSpawned, getEntityIdFromKeys([BigInt(realmEntityId)]));

    const spawnDelay: bigint = npcConfig!.spawn_delay;
    const lastSpawnedTimestamp: bigint = BigInt(last_spawned?.last_spawned_ts ?? 0);
    const nextBlockTimestampBigint: bigint = BigInt(nextBlockTimestamp!);

    if (nextBlockTimestampBigint > spawnDelay + lastSpawnedTimestamp) {
      return READY_TO_SPAWN;
    }
    return Number(spawnDelay - (nextBlockTimestampBigint - lastSpawnedTimestamp));
  };

  const isRealmFull = (): boolean => {
    const realmRegistry = getComponentValue(RealmRegistry, getEntityIdFromKeys([BigInt(realmEntityId)]));
    if ((realmRegistry?.num_native_npcs ?? 0) >= 5 || (realmRegistry?.num_resident_npcs ?? 0) >= 5) {
      console.log("Realm is full");
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col">
      <SortPanel className="flex justify-between px-3 py-2">
        {sortingParams.map(({ label, sortKey, className }, index: number) => (
          <SortButton
            className={className}
            key={index}
            label={label}
            sortKey={sortKey}
            activeSort={sortedByParam}
            onChange={(_sortKey, _sort) => {
              setSortedByParam({
                sortKey: _sortKey,
                sort: _sort,
              });
            }}
          />
        ))}
      </SortPanel>

      <SortPanel className="flex justify-center px-3 py-2 ">
        {npcGroupSortingParams.map(({ label, className }, index) => (
          <NpcSortButton
            key={index}
            className={className}
            label={label}
            isActive={displayedNpcGroup === label}
            onChange={() => {
              setDisplayedNpcGroup((prevState) => (prevState === label ? "None" : label));
            }}
          />
        ))}
      </SortPanel>

      {Object.entries(villagers).map(
        ([group, villagers], index: number) =>
          (displayedNpcGroup === group || displayedNpcGroup === "None") && (
            <div key={index}>
              <div className="flex items-center">{getNpcHeadline(villagers ? villagers.length : 0, group)}</div>

              {group === "residents" &&
                !isRealmFull() &&
                (npcIsSpawning ? (
                  <div className="text-white text-center flex justify-center">
                    <div className="flex justify-center">
                      <img src="/images/eternum-logo_animated.png" className="invert w-1/6" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-row items-center justify-center text-xxs italic text-light-pink mb-1">
                      {getSpawnInfo()}
                    </div>
                  </>
                ))}

              {villagers &&
                sortVillagers(villagers, sortedByParam)?.map((villager) => (
                  <div className="flex flex-col p-2" key={villager.npc.entityId}>
                    <VillagerComponent villager={villager} />
                  </div>
                ))}
            </div>
          ),
      )}
    </div>
  );
};