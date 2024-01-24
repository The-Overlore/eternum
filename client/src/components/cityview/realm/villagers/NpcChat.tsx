import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import NpcChatMessage from "./NpcChatMessage";
import { NpcChatMessageProps } from "./NpcChatMessage";
import { storedTownhall } from "./types"

interface NpcChatProps {
  spawned: number;
  realmId: bigint;
  selectedTownhall: string | null;
  setSelectedTownhall: (newIndex: string | null) => void; 
}

// Store chat history in this ;
const NpcChat = ({ spawned, realmId, selectedTownhall, setSelectedTownhall }: NpcChatProps) => {
  const chatIdentifier: string = `npc_chat_${realmId}`;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messageList, setMessageList] = useState<NpcChatMessageProps[]>(
    JSON.parse(window.localStorage.getItem(chatIdentifier) ?? "[]"),
  );
  
  const str_realmId = realmId.toString();
  

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_OVERLORE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });

  let currkey;
  const currEntry = localStorage.getItem(chatIdentifier);
  if (currEntry) {
    const currObj = JSON.parse(currEntry)
    const keys = Object.keys(currObj);
    if (keys.length > 0) {
      const lastkey = keys[keys.length - 1];
      if (lastkey)
        currkey = lastkey;
    }
  }
  
  // Runs when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastJsonMessage === null) {
      return;
    }
    else {
      let msgObject = JSON.parse(JSON.stringify(lastJsonMessage, null, 2));
      let msg_id = Object.keys(msgObject)[0];
      let msg_disc = msgObject[msg_id];
      // let msgsArray: string[] = JSON.parse(JSON.stringify(msg_disc)).split("\n\n");
      let msgsArray: string[] = msg_disc.split("\n\n");
      
      if (msgsArray[msgsArray.length - 1] === "") {
        msgsArray.pop();
      }
      
      const newMessages = msgsArray.map((msg) => {
        const nameMsg = msg.split(":");
        return { sender: nameMsg[0], message: nameMsg[1] };
      });
      
      const newArray = [...newMessages];
      const newItem: storedTownhall = {};
      newItem[msg_id] = newArray;
      
      const curr = localStorage.getItem(chatIdentifier);
      if (curr) {
        const currArray: storedTownhall = JSON.parse(curr);
        currArray[msg_id] = newArray;
        localStorage.setItem(chatIdentifier, JSON.stringify(currArray));
      } else {
        localStorage.setItem(chatIdentifier, JSON.stringify(newItem));
      }
      setSelectedTownhall(msg_id);

      setMessageList(newArray);
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 1);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (spawned === -1) {
      return;
    }

  sendJsonMessage({
      str_realmId,
    });
  }, [spawned]);

  useEffect(() => {
    console.log("Connection state changed");
    console.log("realmId")
    console.log(realmId)
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
            // Retrieve and parse the data from localStorage
            const storedData = JSON.parse(localStorage.getItem(chatIdentifier) ?? "{}");
            // Access the array of messages using selectedTownhall
            const messagesAtIndex = storedData[selectedTownhall];
            const idx = selectedTownhall;
            // Check if messages exist and map through them
            if (messagesAtIndex && messagesAtIndex.length) {
              return messagesAtIndex.map((message, index) => (
                <NpcChatMessage key={index} {...message} />
              ));
            } else {
              return <div>No messages available</div>;
            }
          })()
        }  
          <span className="" ref={bottomRef}></span>
        </>
      </div>
    </div>
  );
};

export default NpcChat;
