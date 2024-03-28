import { useEffect, useMemo, useState } from "react";
import { Tabs } from "../../../elements/tab";
import { TownhallPanel } from "./villagers/panels/townhall/TownhallPanel";
import { ResidentsPanel } from "./villagers/panels/residents/ResidentsPanel";
import useRealmStore from "../../../hooks/store/useRealmStore";
import useUIStore from "../../../hooks/store/useUIStore";
import { useRoute, useLocation } from "wouter";
import { TravelersPanel } from "./villagers/panels/travelers/TravelersPanel";
import { AtGatesPanel } from "./villagers/panels/atGates/AtGatesPanel";

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
        key: "residents",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: <p className="whitespace-nowrap">Show the resident villagers of your Realm</p>,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            Residents
          </div>
        ),
        component: <ResidentsPanel />,
      },
      {
        key: "travelers",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: <p className="whitespace-nowrap">Show your traveling villagers</p>,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            Travelers
          </div>
        ),
        component: <TravelersPanel />,
      },
      {
        key: "at_gates",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: <p className="whitespace-nowrap">Show the villagers at your gates asking to come in</p>,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            At your gates
          </div>
        ),
        component: <AtGatesPanel />,
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
