const _ = require("lodash");
import * as dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ResponseInterface,
  SuccessResponseInterface,
} from "../src/models/application/response";
import { CabinInterface } from "../src/models/data/cabin";

dotenv.config({ path: __dirname + "/./../src/config/.env" });

const BEFORE_ALL_TIMEOUT = 30000;

const { BASE_SERVER_URL, PORT } = process.env;

const apiBaseUrl = `${BASE_SERVER_URL}:${PORT}`;

const expectSuccess = (
  response: Response,
  body: ResponseInterface,
  successCode: number = 200
): body is SuccessResponseInterface => {
  expect(response.status).toBe(successCode);
  expect(body?.status).toBe("success");
  return response.status === successCode && body?.status === "success";
};

describe("Cabins CRUD", () => {
  const createdCabin: CabinInterface = {
    name: "test",
    description: "test",
    imageUrl: "test",
    type: "abandoned",
    latLng: [0, 0, 0],
  };
  const updatedCabin: CabinInterface = {
    name: "test2",
    description: "test2",
    imageUrl: "test2",
    type: "incomplete",
    latLng: [1, 1, 1],
  };
  let createdCabinId: string;

  /**
   * Fetches a cabin by its id and compares it to a given cabin
   * @param cabinId
   * @param comparedCabin
   */
  const checkCabin = (comparedCabin: CabinInterface | null) => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/cabins/${createdCabinId}`, {
        method: "GET",
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and return the same cabin", () => {
      // comparedCabin === null means we expect not to find the cabin.
      if (comparedCabin === null) {
        expect(response.status).toBe(404);
        expect(body?.status).toBe("fail");
        return;
      }
      if (!expectSuccess(response, body)) {
        return;
      }
      const { _id, ...receivedCabin } = body.data;
      expect(_.isEqual(receivedCabin, comparedCabin)).toBe(true);
    });
  };

  // CREATE
  describe("Create cabins", () => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/cabins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(createdCabin),
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and contain id", () => {
      if (!expectSuccess(response, body, 201)) {
        return;
      }
      expect(body.data.id).toBeDefined();
      createdCabinId = body.data.id;
    });
  });

  // GET ALL
  describe.skip("Fetch cabins", () => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/cabins`, {
        method: "GET",
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and return an array of cabins", () => {
      if (!expectSuccess(response, body)) {
        return;
      }
      expect(Array.isArray(body.data)).toBe(true);
    });

    // Not empty cause we just created one cabin.
    it("The array should not be empty", () => {
      //? Find out if there's a way to exit early in vitest. It doesn't make sense
      // to test the array length if it's not an array (previous test failed).
      // Furthermore, typescript here doesn't know if body.data is an array or not,
      // meaning I have to cast the type to avoid errors.
      expect((body as { data: any[] })?.data?.length > 0).toBe(true);
    });
  });

  // CHECK CREATION
  describe("Fetch cabin by id", () => {
    checkCabin(createdCabin);
  });

  // UPDATE
  describe("Update cabin", () => {
    let response: Response;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/cabins/${createdCabinId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedCabin),
      });
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed", () => {
      // 204 means no response, so no check on body status.
      expect(response.status).toBe(204);
    });
  });

  describe("Fetch updated cabin by id", () => {
    checkCabin(updatedCabin);
  });

  // DELETE
  describe("Delete cabin", () => {
    let response: Response;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/cabins/${createdCabinId}`, {
        method: "DELETE",
      });
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed", () => {
      // 204 means no response, so no check on body status.
      expect(response.status).toBe(204);
    });
  });

  // CHECK DELETION
  describe("Fetch cabin by id", () => {
    checkCabin(null);
  });
});
