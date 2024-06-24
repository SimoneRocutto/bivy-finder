import { collections } from "../database";
import { Employee } from "../../models/data/employee";
import { CollectionConfigInterface } from "../../models/application/database";

export const employeesConfig: CollectionConfigInterface = {
  name: "employees",
  init: (db) => {
    const employeesCollection = db.collection<Employee>("employees");
    collections.employees = employeesCollection;
  },
  schema: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "position", "level"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
        position: {
          bsonType: "string",
          description: "'position' is required and is a string",
          minLength: 5,
        },
        level: {
          bsonType: "string",
          description:
            "'level' is required and is one of 'junior', 'mid', or 'senior'",
          enum: ["junior", "mid", "senior"],
        },
      },
    },
  },
};
