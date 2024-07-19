import { bivouacsConfig } from "./bivouacs";
import { usersConfig } from "./users";
import { CollectionConfigInterface } from "../../models/application/database";

export const collectionsConfigs: CollectionConfigInterface[] = [
  usersConfig,
  bivouacsConfig,
];
