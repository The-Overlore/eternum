import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../../../elements/tab";
import {
  addDiscussionToStorage,
  getMostRecentStorageDiscussionKey,
  DiscussionPanel,
} from "./villagers/panels/discussion/DiscussionPanel";
import { VillagersPanel } from "./villagers/panels/villagers/VillagersPanel";
import useRealmStore from "../../../hooks/store/useRealmStore";
import useUIStore from "../../../hooks/store/useUIStore";
import { useRoute, useLocation } from "wouter";
import useNpcStore from "../../../hooks/store/useNpcStore";
import { keysSnakeToCamel } from "./villagers/utils";
import { DiscussionProvider } from "./villagers/panels/discussion/DiscussionContext";

type RealmVillagersComponentProps = {};

export const RealmNpcComponent = ({}: RealmVillagersComponentProps) => {
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [lastMessageDisplayedIndex, setLastMessageDisplayedIndex] = useState<number>(0);

  const [selectedTab, setSelectedTab] = useState(0);

  const { loreMachineJsonRpcCall, initializedRealms, setInitialisedRealms } = useNpcStore();

  const { realmEntityId, realmId } = useRealmStore();

  const moveCameraToLaborView = useUIStore((state) => state.moveCameraToLaborView);
  const moveCameraToFoodView = useUIStore((state) => state.moveCameraToFoodView);
  const setTooltip = useUIStore((state) => state.setTooltip);

  const LOCAL_STORAGE_ID: string = `npc_chat_${realmId}`;

  // @ts-ignore
  const [location, setLocation] = useLocation();
  // @ts-ignore
  const [match, params]: any = useRoute("/realm/:id/:tab");

  const initializeRealm = async () => {
    const mostRecentTs: number = 1 + getMostRecentStorageDiscussionKey(LOCAL_STORAGE_ID);

    const response = await loreMachineJsonRpcCall("getDiscussions", {
      start_time: mostRecentTs,
      realm_id: Number(realmId),
    });

    let firstTs = 0;
    response.discussions.forEach((discussion: any) => {
      const discussionCamel = keysSnakeToCamel(discussion);
      const ts = addDiscussionToStorage(discussionCamel, LOCAL_STORAGE_ID);
      if (firstTs === 0) {
        firstTs = ts;
      }
    });

    if (firstTs !== 0) {
      setSelectedDiscussion(firstTs);
    }

    setInitialisedRealms([...initializedRealms, realmId!]);
  };

  useEffect(() => {
    if (initializedRealms.includes(realmId!)) {
      return;
    }
    initializeRealm();
  }, [realmId]);

  useEffect(() => {
    let _tab: string = "";
    if (["villagers"].includes(params?.tab as string)) {
      _tab = "villagers";
      moveCameraToFoodView();
    } else {
      _tab = params?.tab as any;
      moveCameraToLaborView();
    }
    const tabIndex = tabs.findIndex((tab) => tab.key === _tab);
    if (tabIndex >= 0) {
      setSelectedTab(tabIndex);
    }
  }, [params]);

  const tabs = useMemo(
    () => [
      {
        key: "townhall",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({ position: "bottom", content: <p className="whitespace-nowrap">Talk with your villagers</p> })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            Townhall
          </div>
        ),

        component: <DiscussionPanel />,
      },
      {
        key: "villagers",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: <p className="whitespace-nowrap">Visit your villagers</p>,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            <div className="flex flex-row items-baseline">
              <p>Villagers</p>
            </div>
          </div>
        ),
        component: <VillagersPanel />,
      },
    ],
    [selectedTab],
  );

  return (
    <DiscussionProvider
      selectedDiscussion={selectedDiscussion}
      setSelectedDiscussion={setSelectedDiscussion}
      lastMessageDisplayedIndex={lastMessageDisplayedIndex}
      setLastMessageDisplayedIndex={setLastMessageDisplayedIndex}
    >
      <Tabs
        selectedIndex={selectedTab}
        onChange={(index: any) => setLocation(`/realm/${realmEntityId}/${tabs[index].key}`)}
        variant="default"
        className="h-full"
      >
        <Tabs.List>
          {tabs.map((tab, index) => (
            <Tabs.Tab key={index}>{tab.label}</Tabs.Tab>
          ))}
        </Tabs.List>
        <Tabs.Panels className="overflow-hidden">
          {tabs.map((tab, index) => (
            <Tabs.Panel key={index}>{tab.component}</Tabs.Panel>
          ))}
        </Tabs.Panels>
      </Tabs>
    </DiscussionProvider>
  );
};

export default RealmNpcComponent;
