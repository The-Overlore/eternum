import { useEffect, useMemo, useState } from "react";
import { OrderIcon } from "../../../../../elements/OrderIcon";
import Button from "../../../../../elements/Button";
import { ResourceIcon } from "../../../../../elements/ResourceIcon";
import { MarketInterface, Resource, RoadInterface, findResourceById, orderNameDict } from "@bibliothecadao/eternum";
import { ReactComponent as RatioIcon } from "@/assets/icons/common/ratio.svg";
import * as realmsData from "../../../../../../data/geodata/realms.json";
import { useGetRealm } from "../../../../../../hooks/helpers/useRealm";
import clsx from "clsx";
import { currencyFormat } from "../../../../../utils/utils";
import useUIStore from "../../../../../../hooks/store/useUIStore";
import { useCaravan } from "../../../../../../hooks/helpers/useCaravans";
import useRealmStore from "../../../../../../hooks/store/useRealmStore";
import { useRoads } from "../../../../../../hooks/helpers/useRoads";
import { useTrade } from "../../../../../../hooks/helpers/useTrade";

type TradeOfferProps = {
  roads: RoadInterface[];
  marketOffer: MarketInterface;
  onAccept: () => void;
  onBuildRoad: () => void;
};

export const MarketOffer = ({ marketOffer, roads, onAccept, onBuildRoad }: TradeOfferProps) => {
  const { makerId, takerGets: resourcesGet, makerGets: resourcesGive, ratio } = marketOffer;

  let { realm: makerRealm } = useGetRealm(marketOffer.makerId);
  const setTooltip = useUIStore((state) => state.setTooltip);
  const realmEntityId = useRealmStore((state) => state.realmEntityId);

  const [isLoading, setIsLoading] = useState(false);

  const { calculateDistance } = useCaravan();
  const { getHasRoad } = useRoads();
  const { canAcceptOffer } = useTrade();

  const distance = useMemo(() => {
    return calculateDistance(makerId, realmEntityId) || 0;
  }, [makerId, realmEntityId]);

  const hasRoad = useMemo(() => {
    return getHasRoad(realmEntityId, makerId);
  }, [realmEntityId, makerId, roads]);

  const canAccept = useMemo(() => {
    return canAcceptOffer({ realmEntityId, resourcesGive });
  }, [realmEntityId, resourcesGive]);

  useEffect(() => {
    setIsLoading(false);
  }, [marketOffer]);

  return (
    <div className="flex flex-col p-2 border rounded-md border-gray-gold text-xxs text-gray-gold">
      <div className="flex items-center justify-between">
        {makerRealm && (
          <div className="flex items-center p-1 -mt-2 -ml-2 border border-t-0 border-l-0 rounded-br-md border-gray-gold">
            {/* // order of the order maker */}
            {makerRealm.order && <OrderIcon order={orderNameDict[makerRealm.order]} size="xs" className="mr-1" />}
            {realmsData["features"][Number(makerRealm.realmId) - 1]?.name || ""}
          </div>
        )}
        <div className=" text-gold flex">
          <div className=" text-right">{`${distance.toFixed(0)} km`}</div>
          <Button
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: hasRoad ? (
                  <>
                    <p className="whitespace-nowrap">A road has been built to this realm.</p>
                    <p className="whitespace-nowrap">You have +100% speed boost.</p>
                  </>
                ) : (
                  <>
                    <p className="whitespace-nowrap">Click to build road and</p>
                    <p className="whitespace-nowrap">speed up trades with this Realm.</p>
                  </>
                ),
              })
            }
            size="xs"
            variant="outline"
            onMouseLeave={() => setTooltip(null)}
            className="text-gold/50 relative group ml-2"
            onClick={() => {
              if (!hasRoad) onBuildRoad();
            }}
          >
            {hasRoad ? "x2 speed" : "Normal speed"}
          </Button>
        </div>
      </div>
      <div className="flex items-end mt-2">
        <div className={clsx("flex items-center justify-around flex-1", !canAccept && " mb-3")}>
          <div className="flex-1 text-gold flex justify-center items-center flex-wrap">
            {resourcesGive &&
              resourcesGive.map(({ resourceId, amount }) => (
                <div className="flex flex-col items-center mx-1 my-0.5" key={resourceId}>
                  <ResourceIcon resource={findResourceById(resourceId)?.trait as any} size="sm" className="mb-1" />
                  {currencyFormat(amount, 0)}
                </div>
              ))}
          </div>
          <div className="flex flex-col items-center text-white">
            <RatioIcon className="mb-1 fill-white" />
            {resourcesGive && resourcesGet && ratio.toFixed(2)}
          </div>
          <div className="flex-1 text-gold flex justify-center items-center flex-wrap">
            {resourcesGet &&
              resourcesGet.map(({ resourceId, amount }) => (
                <div className="flex flex-col items-center mx-1 my-0.5" key={resourceId}>
                  <ResourceIcon resource={findResourceById(resourceId)?.trait as any} size="sm" />
                  {currencyFormat(amount, 0)}
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col justify-center relative">
          <Button
            isLoading={isLoading}
            disabled={!canAccept}
            onClick={() => {
              onAccept();
            }}
            variant={canAccept ? "success" : "danger"}
            className={clsx("ml-auto p-2 !h-4 text-xxs !rounded-md", !canAccept && "mb-4")}
          >{`Accept`}</Button>
          {!canAccept && (
            <div className="text-xxs text-order-giants/70 w-min absolute whitespace-nowrap right-0 bottom-0">
              Insufficient resources
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const calculateRatio = (resourcesGive: Resource[], resourcesGet: Resource[]) => {
  let quantityGive = 0;
  for (let i = 0; i < resourcesGive.length; i++) {
    quantityGive += resourcesGive[i].amount;
  }
  let quantityGet = 0;
  for (let i = 0; i < resourcesGet.length; i++) {
    quantityGet += resourcesGet[i].amount;
  }
  return quantityGet / quantityGive;
};
