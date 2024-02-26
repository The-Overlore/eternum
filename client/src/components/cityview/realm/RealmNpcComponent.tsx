import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../../../elements/tab";
import { NpcPanel } from "./villagers/NpcPanel";
import { NpcListPanel } from "./villagers/NpcListPanel";
import useRealmStore from "../../../hooks/store/useRealmStore";
import useUIStore from "../../../hooks/store/useUIStore";
import { useRoute, useLocation } from "wouter";
import { NpcProvider } from "./villagers/NpcContext";

type RealmVillagersComponentProps = {};

export const RealmNpcComponent = ({}: RealmVillagersComponentProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { realmEntityId } = useRealmStore();

  const moveCameraToLaborView = useUIStore((state) => state.moveCameraToLaborView);
  const moveCameraToFoodView = useUIStore((state) => state.moveCameraToFoodView);
  const setTooltip = useUIStore((state) => state.setTooltip);

  // @ts-ignore
  const [location, setLocation] = useLocation();
  // @ts-ignore
  const [match, params]: any = useRoute("/realm/:id/:tab");

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
        label: <div>Townhall</div>,
        component: <NpcPanel />,
      },
      {
        key: "npcs",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({ position: "bottom", content: <p className="whitespace-nowrap">Tooltip</p> })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            Villagers
          </div>
        ),
        component: <NpcListPanel />,
      },
    ],
    [selectedTab],
  );

  return (
    <NpcProvider>
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
    </NpcProvider>
  );
};

export default RealmNpcComponent;
