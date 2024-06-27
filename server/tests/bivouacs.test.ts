const _ = require("lodash");
import * as dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ResponseInterface,
  SuccessResponseInterface,
} from "../src/models/application/response";
import { BivouacInterface } from "../src/models/data/bivouac";

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

describe("Bivouacs CRUD", () => {
  const createdBivouac: BivouacInterface = {
    name: "test",
    description: "test",
    imageUrl: "test",
    type: "abandoned",
    latLng: [0, 0, 0],
  };
  const updatedBivouac: BivouacInterface = {
    name: "test2",
    description: "test2",
    imageUrl: "test2",
    type: "incomplete",
    latLng: [1, 1, 1],
  };
  let createdBivouacId: string;

  /**
   * Fetches a bivouac by its id and compares it to a given bivouac
   * @param bivouacId
   * @param comparedBivouac
   */
  const checkBivouac = (comparedBivouac: BivouacInterface | null) => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/bivouacs/${createdBivouacId}`, {
        method: "GET",
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and return the same bivouac", () => {
      // comparedBivouac === null means we expect not to find the bivouac.
      if (comparedBivouac === null) {
        expect(response.status).toBe(404);
        expect(body?.status).toBe("fail");
        return;
      }
      if (!expectSuccess(response, body)) {
        return;
      }
      const { _id, ...receivedBivouac } = body.data;
      expect(_.isEqual(receivedBivouac, comparedBivouac)).toBe(true);
    });
  };

  // CREATE
  describe("Create bivouacs", () => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/bivouacs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(createdBivouac),
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and contain id", () => {
      if (!expectSuccess(response, body, 201)) {
        return;
      }
      expect(body.data.id).toBeDefined();
      createdBivouacId = body.data.id;
    });
  });

  // GET ALL
  describe.skip("Fetch bivouacs", () => {
    let response: Response;
    let body: ResponseInterface;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/bivouacs`, {
        method: "GET",
      });
      body = await response.json();
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed and return an array of bivouacs", () => {
      if (!expectSuccess(response, body)) {
        return;
      }
      expect(Array.isArray(body.data)).toBe(true);
    });

    // Not empty cause we just created one bivouac.
    it("The array should not be empty", () => {
      //? Find out if there's a way to exit early in vitest. It doesn't make sense
      // to test the array length if it's not an array (previous test failed).
      // Furthermore, typescript here doesn't know if body.data is an array or not,
      // meaning I have to cast the type to avoid errors.
      expect((body as { data: any[] })?.data?.length > 0).toBe(true);
    });
  });

  // CHECK CREATION
  describe("Fetch bivouac by id", () => {
    checkBivouac(createdBivouac);
  });

  // UPDATE
  describe("Update bivouac", () => {
    let response: Response;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/bivouacs/${createdBivouacId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedBivouac),
      });
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed", () => {
      // 204 means no response, so no check on body status.
      expect(response.status).toBe(204);
    });
  });

  describe("Fetch updated bivouac by id", () => {
    checkBivouac(updatedBivouac);
  });

  // DELETE
  describe("Delete bivouac", () => {
    let response: Response;

    beforeAll(async () => {
      response = await fetch(`${apiBaseUrl}/bivouacs/${createdBivouacId}`, {
        method: "DELETE",
      });
    }, BEFORE_ALL_TIMEOUT);

    it("Should succeed", () => {
      // 204 means no response, so no check on body status.
      expect(response.status).toBe(204);
    });
  });

  // CHECK DELETION
  describe("Fetch bivouac by id", () => {
    checkBivouac(null);
  });
});
