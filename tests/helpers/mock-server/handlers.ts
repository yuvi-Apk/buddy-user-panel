// The default mock backend for app tests: the auth endpoints of the contract (setup plan,
// section 13). By default nobody is signed in: refresh is refused, logout succeeds.
// A test changes this with server.use(...), which lasts until the test ends.
import { http } from "msw";
import { apiPath, errorResponse, makeUser, successResponse } from "./backend";

export const handlers = [
  http.post(apiPath("/user/auth/refresh"), () =>
    errorResponse(401, "Please log in again")
  ),
  http.post(apiPath("/user/auth/logout"), () =>
    successResponse(null, { message: "Logged out" })
  ),
  http.get(apiPath("/user/auth/me"), () => successResponse(makeUser())),
];
