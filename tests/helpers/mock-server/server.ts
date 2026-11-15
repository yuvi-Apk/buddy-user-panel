// The MSW server every app test runs against (started in tests/helpers/setup.ts). A request with no
// handler fails the test, so nothing ever reaches a real network.
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
