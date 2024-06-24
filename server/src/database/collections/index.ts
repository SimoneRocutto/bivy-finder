import { bivouacsConfig } from "./bivouacs";
import { employeesConfig } from "./employees";
import { usersConfig } from "./users";
import { CollectionConfigInterface } from "../../models/application/database";

export const collectionsConfigs: CollectionConfigInterface[] = [
  employeesConfig,
  usersConfig,
  bivouacsConfig,
];
