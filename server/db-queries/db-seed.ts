import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { UserInterface } from "../src/models/data/user";
import {
  CabinInterface,
  cabinMaterials,
  cabinTypes,
  costPers,
  currencies,
  PublicTransport,
  StartingSpotInterface,
} from "../src/models/data/cabin";
import { unformatLatLng } from "../src/helpers/misc";
import { MongoClient } from "mongodb";
import { exit } from "process";

const encryptPassword = async (rawPassword) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(rawPassword, salt);
};

const tweakCoordinate = (
  coordinate: number,
  maxVariation = 0.1,
  multipleOf = 0.0000001
) =>
  coordinate +
  faker.number.float({
    min: -1 * maxVariation,
    max: maxVariation,
    multipleOf,
  });

const tweakAltitude = (coordinate: number, maxVariation = 2000) =>
  coordinate +
  faker.number.int({
    min: -1 * maxVariation,
    max: maxVariation,
  });

async function seedDB({ fakeCabinsCount = 500, fakeUsersCount = 500 } = {}) {
  // TODO Add schema validation
  // TODO Write function for single collection seeding

  console.log("starting");

  dotenv.config({ path: __dirname + "/../src/config/.env" });

  console.log("Reading env");
  const { ATLAS_URI, ATLAS_DB } = process.env;
  if (!ATLAS_URI || !ATLAS_DB) {
    console.log("Missing ATLAS_URI or ATLAS_DB environment variable");
    process.exit();
  }
  console.log("Connecting to db...");
  const client = new MongoClient(ATLAS_URI);

  try {
    await client.connect();
    console.log("Connected correctly to db");

    const configCollection = client.db(ATLAS_DB).collection("config");
    const config = (await configCollection.find().toArray())[0];
    const allowAccessForTests = config?.allowAccessForTests;

    if (!allowAccessForTests) {
      throw "Seeding has not been enabled for this database.";
    }

    console.log("Dropping users collection...");
    const usersCollection = client.db(ATLAS_DB).collection("users");
    await usersCollection.drop();
    console.log("Collection dropped!");

    if (fakeUsersCount > 0) {
      const users: UserInterface[] = [];
      // For testing purposes, all users will have the same password
      const rawPassword = "test-password";
      const password = await encryptPassword(rawPassword);

      // Create admin user
      const admin: UserInterface = {
        username: "admin",
        password,
        role: "admin",
      };
      users.push(admin);

      console.log("Seeding users...");
      // Create users
      for (let i = 0; i < fakeUsersCount - 1; i++) {
        const user: UserInterface = {
          username: faker.internet.username(),
          password,
        };
        users.push(user);
      }

      await usersCollection.insertMany(users);
      console.log(
        `1 admin user + ${fakeUsersCount - 1} non-admin user(s) created!`
      );
    } else {
      console.log("Skipping user seeding.");
    }

    console.log("Dropping cabins collection...");
    const cabinsCollection = client.db(ATLAS_DB).collection("cabins");
    await cabinsCollection.drop();
    console.log("Collection dropped!");

    // Create cabins
    if (fakeCabinsCount > 0) {
      console.log("Seeding cabins...");
      const cabins: CabinInterface[] = [];
      for (let i = 0; i < fakeCabinsCount; i++) {
        const fakeLat = faker.location.latitude({ min: 35, max: 47 });
        const fakeLng = faker.location.longitude({ min: 6, max: 19 });
        const fakeAlt = faker.number.int({ min: -100, max: 8000 });

        // Create starting spots
        const startingSpots: StartingSpotInterface[] = [];
        for (let j = 0; j < faker.number.int({ min: 0, max: 3 }); j++) {
          const latLng = unformatLatLng([
            tweakCoordinate(fakeLat),
            tweakCoordinate(fakeLng),
            tweakAltitude(fakeAlt),
          ]);
          if (!latLng) {
            throw "LatLng unformatting failed.";
          }
          const hasCarParking = faker.datatype.boolean();

          // Create public transports
          const publicTransports: PublicTransport[] = [];
          for (let k = 0; k < faker.number.int({ min: 0, max: 5 }); j++) {
            const publicTransport: PublicTransport = {
              name: faker.lorem.word(),
              cost: {
                value: Number(faker.finance.amount({ min: 0, max: 100 })) * 100,
                currency: faker.helpers.arrayElement(currencies),
              },
              description: faker.lorem.paragraph(),
            };
            publicTransports.push(publicTransport);
          }

          const startingSpot: StartingSpotInterface = {
            latLng,
            description: faker.lorem.paragraph(),
            timeToDestination: faker.number.int({
              min: 0,
              max: 24 * 60 * 60 * 1000,
              multipleOf: 1000,
            }),
            transport: {
              ...(hasCarParking && {
                car: {
                  cost: {
                    value:
                      Number(faker.finance.amount({ min: 0, max: 100 })) * 100,
                    currency: faker.helpers.arrayElement(currencies),
                    per: faker.helpers.arrayElement(costPers),
                  },
                },
              }),
              public: publicTransports,
            },
          };
          startingSpots.push(startingSpot);
        }

        const cabin: CabinInterface = {
          name: faker.lorem.words({ min: 1, max: 2 }),
          description: faker.lorem.paragraphs({ min: 0, max: 5 }),
          latLng: unformatLatLng([fakeLat, fakeLng, fakeAlt]),
          type: faker.helpers.arrayElement(cabinTypes),
          material: faker.helpers.arrayElement(cabinMaterials),
          startingSpots: startingSpots,
        };
        cabins.push(cabin);
      }
      await cabinsCollection.insertMany(cabins);
      console.log(`${fakeCabinsCount} cabin(s) created!`);
    } else {
      console.log("Skipping cabins seeding.");
    }

    // Testing that we created the right amount of documents
    const usersCheckCount = await usersCollection.countDocuments();
    if (usersCheckCount !== fakeUsersCount) {
      throw "Users count expectation failed.";
    }

    const cabinsCheckCount = await cabinsCollection.countDocuments();
    if (cabinsCheckCount !== fakeCabinsCount) {
      throw "Cabins count expectation failed.";
    }

    console.log("Database seeded!");
    client.close();
  } catch (err) {
    console.error("\nError: \n " + err + "\nExiting...\n");
    client.close();
    exit(1);
  }
}

seedDB();
