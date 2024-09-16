import { cabinsConfig } from "./cabins";
import { usersConfig } from "./users";
import { CollectionConfigInterface } from "../../models/application/database";

export const collectionsConfigs: CollectionConfigInterface[] = [
  usersConfig,
  cabinsConfig,
];
