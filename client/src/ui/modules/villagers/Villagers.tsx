import useUIStore from "../../../hooks/store/useUIStore";
import { OSWindow } from "../../components/navigation/OSWindow";
import { villagers } from "../../components/navigation/Config";
import { useMemo, useState } from "react";
import { DiscussionPanel } from "@/ui/components/cityview/realm/villagers/panels/discussion/DiscussionPanel";
import { VillagersPanel } from "@/ui/components/cityview/realm/villagers/panels/villagers/VillagersPanel";
import { Tabs } from "@/ui/elements/tab";
import { DiscussionProvider } from "@/ui/components/cityview/realm/villagers/panels/discussion/DiscussionContext";
import { NpcPopup } from "@/ui/components/cityview/realm/villagers/NpcPopup";
import useNpcStore from "@/hooks/store/useNpcStore";
import { TravelNpcPopup } from "@/ui/components/cityview/realm/villagers/panels/villagers/TravelNpcPopup";

export const Villagers = ({ entityId }: { entityId: bigint | undefined }) => {
  const { togglePopup } = useUIStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [lastMessageDisplayedIndex, setLastMessageDisplayedIndex] = useState<number>(0);
  const { npcInInfoPopup, setNpcInInfoPopup, npcInTravelPopup, setNpcInTravelPopup } = useNpcStore();

  const isOpen = useUIStore((state) => state.isPopupOpen(villagers));

  const tabs = useMemo(
    () => [
      {
        key: "all",
        label: (
          <div className="flex relative group flex-col items-center">
            <div>Town hall</div>
          </div>
        ),
        component: <DiscussionPanel />,
      },
      {
        key: "transfer",
        label: (
          <div className="flex relative group flex-col items-center">
            <div>Villagers</div>
          </div>
        ),
        component: <VillagersPanel />,
      },
    ],
    [selectedTab],
  );

  return (
    <>
      {npcInTravelPopup && <TravelNpcPopup onClose={() => setNpcInTravelPopup(null)} />}
      {npcInInfoPopup && <NpcPopup onClose={() => setNpcInInfoPopup(null)} />}
      <OSWindow onClick={() => togglePopup(villagers)} show={isOpen} title={villagers}>
        <DiscussionProvider
          selectedDiscussion={selectedDiscussion}
          setSelectedDiscussion={setSelectedDiscussion}
          lastMessageDisplayedIndex={lastMessageDisplayedIndex}
          setLastMessageDisplayedIndex={setLastMessageDisplayedIndex}
        >
          <div>
            <Tabs selectedIndex={selectedTab} onChange={(index: any) => setSelectedTab(index)} className="h-full">
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
          </div>
        </DiscussionProvider>
      </OSWindow>
    </>
  );
};
