import { Npc } from "../../types";
import Button from "../../../../../../elements/Button";
import { useState } from "react";
import { TravelerDetailsPopup } from "./TravelerDetailsPopup";
import { NpcComponent } from "../../NpcComponent";
import { useDojo } from "../../../../../../DojoContext";
import useRealmStore from "../../../../../../hooks/store/useRealmStore";
type NpcComponentProps = {
  npc: Npc;
};

export const Traveler = ({ npc }: NpcComponentProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    setup: {
      systemCalls: { npc_travel },
    },
    account: { account },
  } = useDojo();

  const { realmEntityId } = useRealmStore();

  const onClose = (): void => {
    setShowDetails(false);
  };

  const bringBack = (): void => {
    if (npc.entityId) {
      setLoading(true);
      npc_travel({
        signer: account,
        npc_entity_id: npc.entityId,
        to_realm_entity_id: realmEntityId!,
      });
      setLoading(false);
      onClose();
    }
  };

  const extraButtons: any = [
    <Button
      size="xs"
      className="ml-auto"
      onClick={() => {
        setShowDetails(true);
      }}
      variant="outline"
      withoutSound
    >
      {`Details`}
    </Button>,
    <Button isLoading={loading} size="xs" className="ml-auto" onClick={() => bringBack} variant="outline" withoutSound>
      {`Bring back`}
    </Button>,
  ];
  return (
    <>
      {showDetails && <TravelerDetailsPopup npc={npc} onClose={onClose} />}
      <NpcComponent npc={npc} extraButtons={extraButtons} />
    </>
  );
};
