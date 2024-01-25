import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import NpcChatMessage from "./NpcChatMessage";
import { storedTownhall } from "./types"

interface NpcChatProps {
  spawned: number;
  realmId: bigint;
  selectedTownhall: string | null;
  setSelectedTownhall: (newIndex: string | null) => void; 
}

const NpcChat = ({ spawned, realmId, selectedTownhall, setSelectedTownhall }: NpcChatProps) => {
  const chatIdentifier: string = `npc_chat_${realmId}`;
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_OVERLORE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });
  
  // Runs when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastJsonMessage === null) {
      return;
    }
    else {
      let msgObject = JSON.parse(JSON.stringify(lastJsonMessage, null, 2));
      let msgKey = Object.keys(msgObject)[0];      
      let msgValue = msgObject[msgKey];    
      let msgsArray: string[] = msgValue.split("\n");
      
      if (msgsArray[msgsArray.length - 1] === "") {
        msgsArray.pop();
      }
      
      const newMessages = msgsArray.map((msg) => {
        const nameMsg = msg.split(":");
        return { sender: nameMsg[0], message: nameMsg[1] };
      });
      
      const newArray = [...newMessages];
      const newItem: storedTownhall = {};
      newItem[msgKey] = newArray;
      
      const curr = localStorage.getItem(chatIdentifier);
      if (curr) {
        const currArray: storedTownhall = JSON.parse(curr);
        currArray[msgKey] = newArray;
        localStorage.setItem(chatIdentifier, JSON.stringify(currArray));
      } else {
        localStorage.setItem(chatIdentifier, JSON.stringify(newItem));
      }
      setSelectedTownhall(msgKey);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (spawned === -1) {
      return;
    }

    sendJsonMessage({
      realm_id: realmId.toString(),
    });
  }, [spawned]);

  useEffect(() => {
    console.log("Connection state changed");
  }, [readyState]);

  useEffect(() => {}, []);
  return (
    <div className="relative flex flex-col h-full overflow-auto">
      <div
        className="relative flex flex-col h-full overflow-auto relative top-3 flex flex-col h-full center mx-auto w-[96%] mb-3 overflow-auto border border-gold"
      >
        <>
        {
          (() => {
            const storedData = JSON.parse(localStorage.getItem(chatIdentifier) ?? "{}");
            const messagesAtIndex = selectedTownhall ? storedData[selectedTownhall] : null;
            if (messagesAtIndex && messagesAtIndex.length) {
              return messagesAtIndex.map((message: any, index: number) => (
                <NpcChatMessage key={index} {...message} />
              ));
            } else {
              return <div>No messages available</div>;
            }
          })()
        }  
        </>
      </div>
    </div>
  );
};

export default NpcChat;
