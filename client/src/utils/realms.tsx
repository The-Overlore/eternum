import realmsCoordsJson from "../geodata/coords.json";
import realmsJson from "../geodata/realms.json";
import realms from "../data/realms.json";
import realmsOrdersJson from "../geodata/realms_raw.json";
import { findResourceIdByTrait, orders } from "@bibliothecadao/eternum";
import { packResources } from "../utils/packedData";
import { RealmInterface } from "@bibliothecadao/eternum";
import { getContractPositionFromRealPosition } from "./utils";

interface Attribute {
  trait_type: string;
  value: any;
}

export const getRealmIdByPosition = (positionRaw: { x: number; y: number }): bigint | undefined => {
  let offset = 1800000;
  let position = { x: positionRaw.x - offset, y: positionRaw.y - offset };
  // TODO: find a better way to find position
  for (let realm of realmsCoordsJson["features"]) {
    if (
      parseInt(realm["geometry"]["coordinates"][0]) === position.x &&
      parseInt(realm["geometry"]["coordinates"][1]) === position.y
    ) {
      return BigInt(realm["properties"]["tokenId"]);
    }
  }
  return undefined;
};

export const getRealmNameById = (realmId: bigint): string => {
  const features = realmsJson["features"][Number(realmId) - 1];
  if (!features) return "";
  return features["name"];
};

export const getRealmOrderNameById = (realmId: bigint): string => {
  const orderName = realmsOrdersJson[Number(realmId) - 1];
  if (!orderName) return "";
  return orderName.order.toLowerCase().replace("the ", "");
};

export function getRealm(realmId: bigint): RealmInterface | undefined {
  const realmsData = realms as {
    [key: string]: any;
  };
  const realm = realmsData[realmId.toString()];
  if (!realm) return;
  const resourceIds = realm.attributes
    .filter(({ trait_type }: Attribute) => trait_type === "Resource")
    .map(({ value }: Attribute) => findResourceIdByTrait(value));
  const resourceTypesPacked = BigInt(packResources(resourceIds));
  let cities: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Cities") {
      cities = value;
    }
  });
  let harbors: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Harbors") {
      harbors = value;
    }
  });
  let rivers: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Rivers") {
      rivers = value;
    }
  });
  let regions: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Regions") {
      regions = value;
    }
  });

  const wonder: number = 1;

  let order: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Order") {
      const name: string = value.split(" ").pop() || "";
      orders.forEach(({ orderId, orderName }) => {
        if (name === orderName) {
          order = orderId;
        }
      });
    }
  });

  let coords = realmsCoordsJson["features"][Number(realmId)]["geometry"]["coordinates"];
  let position = { x: parseInt(coords[0]) + 180000, y: parseInt(coords[1]) + 180000 };

  return {
    realmId,
    name: getRealmNameById(realmId),
    resourceTypesPacked,
    resourceTypesCount: resourceIds.length,
    cities,
    harbors,
    rivers,
    regions,
    wonder,
    order,
    position,
  };
}
