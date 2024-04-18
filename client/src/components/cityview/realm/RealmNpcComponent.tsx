import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../../../elements/tab";
import { TownhallPanel } from "./villagers/panels/townhall/TownhallPanel";
import { VillagersPanel } from "./villagers/panels/villagers/VillagersPanel";
import useRealmStore from "../../../hooks/store/useRealmStore";
import useUIStore from "../../../hooks/store/useUIStore";
import { useRoute, useLocation } from "wouter";

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

        component: <TownhallPanel />,
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
  );
};

export default RealmNpcComponent;
