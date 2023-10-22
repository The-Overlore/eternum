import { useEffect, useRef, useState } from "react";
import { random } from "@latticexyz/utils";
import { nameFromEntityId } from "./utils";
import { Npc } from "./types";
import NpcChatMessage from "./NpcChatMessage";
import GptInterface from "../../../../utils/NpcPrompt";
import { NpcChatMessageProps } from "./NpcChatMessage";
interface NpcChatProps {
  npcs: Npc[];
  genMsg: boolean;
  setGenMsg: any;
}

// Store chat history in this ;
const NpcChat = ({ npcs, genMsg, setGenMsg }: NpcChatProps) => {
  const [messageList, setMessageList] = useState<NpcChatMessageProps[]>(
    JSON.parse(window.localStorage.getItem("npc_chat")),
  );

  // repeating a comment that I saw above this line, somewhere else in the codebase
  // this (also) should be moved
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    
  const [ready, setReady] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const gptInterface = new GptInterface();

  useEffect(() => {
    const generateMessages = async () => {
      if (npcs.length == 0) {
        return;
      }

      // loading!  
      setLoadingMessages(true);          
      const npc = npcs[random(npcs.length - 1, 0)];
      // call chatGTP here

      const response: Response = await gptInterface.generateGreetingPrompts(npc);
      console.log(npc);
      const data = await response.json();
      const generatedPrompt = data.choices[0].message.content.trim();
      console.log(generatedPrompt);
      const sender = nameFromEntityId(npc.entityId, npc.sex);
      let newMessages = messageList;
      newMessages.push({ message: generatedPrompt, sender });
      setMessageList(newMessages);
      window.localStorage.setItem("npc_chat", JSON.stringify(newMessages));
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      setGenMsg(false);
    };
    if (!genMsg) {
      return;
    }
      generateMessages();
      // we are done loading!
      setLoadingMessages(false);
  }, [genMsg]);

  useEffect(() => {
    setReady(true);
  }, []);

  // const createRoom = async (groupName: string) => {
  //     client?.channel.createRoom({
  //         groupName, permissions: {
  //             "group:join": {
  //                 type: "enum",
  //                 value: "public"
  //             }
  //         }
  //     })
  // }

  useEffect(() => {}, []);

  return (
    <div className="relative flex flex-col h-full overflow-auto">
      <div className={"text-white text-xxs pr-2 mt-1"} style={{ position: "static", textAlign: "right" }}>
        NPCs: {npcs.length} / 5
      </div>

      {loadingMessages && (
                <div className="absolute  h-full bg-black w-full text-white text-center flex justify-center">
                    <div className="self-center">
                        <img src="/images/eternum-logo_animated.png" className=" invert scale-50" />
                    </div>
                </div>
       )}
      
      <div className="relative flex flex-col h-full overflow-auto relative top-3 flex flex-col h-full center mx-auto w-[96%] mb-3 overflow-auto border border-gold">
        {messageList?.map((message, index) => {
          return <NpcChatMessage key={index} {...message} />;
        })}
        <span className="" ref={bottomRef}></span>
      </div>
    </div>
  );
};

export default NpcChat;