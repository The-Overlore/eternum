import { useState, useRef, useEffect, RefObject } from "react";

const INTERKEY_STROKEN_DURATION_MS = 25;
const CHARACTER_NUMBER_PER_LINE = 64;

export interface NpcChatMessageProps {
  npcName: string;
  dialogueSegment: string;
  index: number;
  setLastMessageDisplayedIndex: any;
  viewed: boolean;
  bottomRef: RefObject<HTMLElement>;
}

export function useTypingEffect(
  msgIndex: number,
  setLastMessageDisplayedIndex: any,
  bottomRef: RefObject<HTMLElement>,
  textToType: string,
  interKeyStrokeDurationInMs: number,
) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const currentPositionRef = useRef(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPosition((value) => value + 1);
      currentPositionRef.current += 1;
      if (currentPositionRef.current % CHARACTER_NUMBER_PER_LINE == 0) {
        setTimeout(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 1);
      }
      if (currentPositionRef.current > textToType.length) {
        setLastMessageDisplayedIndex(msgIndex + 1);
        clearInterval(intervalId);
      }
    }, interKeyStrokeDurationInMs);
    return () => {
      clearInterval(intervalId);
      currentPositionRef.current = 0;
      setCurrentPosition(0);
    };
  }, [interKeyStrokeDurationInMs, textToType]);
  if (textToType === undefined) {
    return "";
  }
  return textToType.substring(0, currentPosition);
}

export const NpcChatMessage = (props: NpcChatMessageProps) => {
  const { npcName, dialogueSegment, index, setLastMessageDisplayedIndex, bottomRef, viewed } = props;
  const typedDialogSegment = viewed
    ? dialogueSegment
    : useTypingEffect(index, setLastMessageDisplayedIndex, bottomRef, dialogueSegment, INTERKEY_STROKEN_DURATION_MS);

  return (
    <div className="flex flex-col px-2 mb-3 py-1">
      <div className="flex items-center">
        <div className="flex flex-col w-full">
          <div className="flex text-[10px] justify-between">
            <div className="flex">
              <div style={{ userSelect: "text" }} className="text-white/50">
                {npcName}
              </div>
            </div>
          </div>
          <div style={{ userSelect: "text" }} className="mt-1 text-xs text-white/70">
            {typedDialogSegment}
          </div>
        </div>
      </div>
    </div>
  );
};
