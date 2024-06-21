// We are following the JSend specification (https://github.com/omniti-labs/jsend)

// Success response examples

// GET request that returns multiple items
// {
//     status : "success",
//     data : {
//         "posts" : [
//             { "id" : 1, "title" : "A blog post", "body" : "Some useful content" },
//             { "id" : 2, "title" : "Another blog post", "body" : "More content" },
//         ]
//      }
// }

// GET request that returns only one thing
// {
//     status : "success",
//     data : { "post" : { "id" : 2, "title" : "Another blog post", "body" : "More content" }}
// }

// DELETE request
// {
//     status : "success",
//     data : null
// }

export interface SuccessResponseInterface {
  status: "success";
  data: any;
}

// Fail example
// {
//     "status" : "fail",
//     "data" : { "title" : "A title is required" }
// }
export interface FailResponseInterface {
  status: "fail";
  data: any;
}

// Error example
// {
//     "status" : "error",
//     "message" : "Unable to communicate with database"
// }
export interface ErrorResponseInterface {
  status: "error";
  message: string;
}

export type ResponseInterface =
  | SuccessResponseInterface
  | FailResponseInterface
  | ErrorResponseInterface;
