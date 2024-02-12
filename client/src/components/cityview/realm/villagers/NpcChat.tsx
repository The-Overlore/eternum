import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { NpcChatMessage } from "./NpcChatMessage";
import { StorageTownhalls, StorageTownhall, Message, NpcChatProps } from "./types";

const NpcChat = ({ townHallRequest, order, realmId, selectedTownhall, setSelectedTownhall }: NpcChatProps) => {
  const LOCAL_STORAGE_ID: string = `npc_chat_${realmId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_OVERLORE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });
  const [lastMessageDisplayedIndex, setLastMessageDisplayedIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 1);

    if (selectedTownhall === null) {
      return;
    }

    const townhallsInLocalStorage: StorageTownhalls = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID) ?? "{}");
    const storageTownhall: StorageTownhall = townhallsInLocalStorage[selectedTownhall!];

    // Until we haven't reached the last message displayed, don't set the local storage to true. Otherwise the scroll stops after we displayed the first message
    if (lastMessageDisplayedIndex != storageTownhall["discussion"].length - 1) return;

    if (storageTownhall["viewed"] === false) {
      storageTownhall["viewed"] = true;
      townhallsInLocalStorage[selectedTownhall] = storageTownhall;
      localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(townhallsInLocalStorage));
    }
  }, [lastMessageDisplayedIndex]);

  // Runs when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastJsonMessage === null) {
      return;
    }

    const message: Message = lastJsonMessage as Message;
    const townhallKey = message["id"];
    const townhallDiscussion: string[] = message["townhall"].split(/\n+/);

    if (townhallDiscussion[townhallDiscussion.length - 1] === "") {
      townhallDiscussion.pop();
    }

    const discussionsByNpc = townhallDiscussion.map((msg) => {
      const splitMessage = msg.split(":");
      return { npcName: splitMessage[0], dialogueSegment: splitMessage[1] };
    });

    const newEntry: StorageTownhall = { viewed: false, discussion: discussionsByNpc };

    const townhallsInLocalStorage = localStorage.getItem(LOCAL_STORAGE_ID);
    const storedTownhalls: StorageTownhalls = JSON.parse(townhallsInLocalStorage ?? "{}");
    storedTownhalls[townhallKey] = newEntry;
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(storedTownhalls));
    setSelectedTownhall(townhallKey);
  }, [lastJsonMessage]);

  useEffect(() => {
    if (townHallRequest === -1) {
      return;
    }

    sendJsonMessage({
      realm_id: realmId.toString(),
      order: order,
    });
  }, [townHallRequest]);

  useEffect(() => {
    console.log("Connection state changed");
  }, [readyState]);

  useEffect(() => {}, []);
  return (
    <div className="relative flex flex-col h-full overflow-auto">
      <div className="relative flex flex-col h-full overflow-auto relative top-3 flex flex-col h-full center mx-auto w-[96%] mb-3 overflow-auto border border-gold">
        <>
          {(() => {
            const townhallsInLocalStorage: StorageTownhalls = JSON.parse(
              localStorage.getItem(LOCAL_STORAGE_ID) ?? "{}",
            );

            const storageTownhall: StorageTownhall | null =
              selectedTownhall != null ? townhallsInLocalStorage[selectedTownhall] : null;

            if (storageTownhall && storageTownhall["discussion"].length) {
              const isViewed = storageTownhall["viewed"];

              return storageTownhall["discussion"].map((message: any, index: number) => {
                if (!isViewed && index > lastMessageDisplayedIndex) {
                  return <></>;
                }
                return (
                  <NpcChatMessage
                    key={index}
                    index={index}
                    lastMessageDisplayedIndex={lastMessageDisplayedIndex}
                    setLastMessageDisplayedIndex={setLastMessageDisplayedIndex}
                    bottomRef={bottomRef}
                    viewed={isViewed}
                    {...message}
                  />
                );
              });
            } else {
              return <div></div>;
            }
          })()}
          <span className="" ref={bottomRef}></span>;
        </>
      </div>
    </div>
  );
};

export default NpcChat;
