// Tells the person's other tabs when they sign in or out (BroadcastChannel, same site only).
// Only the event travels, never a token or a name.
import { z } from "zod";

const CHANNEL_NAME = "buddy.session";

const messageSchema = z.object({ type: z.enum(["signed-in", "signed-out"]) });

export type SessionEvent = z.output<typeof messageSchema>["type"];

let channel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (channel === undefined) {
    channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function announceSession(type: SessionEvent): void {
  getChannel()?.postMessage({ type });
}

/** Calls `onEvent` when another tab signs in or out. Returns a function that stops listening. */
export function listenForSessionEvents(
  onEvent: (type: SessionEvent) => void
): () => void {
  const current = getChannel();
  if (!current) return () => {};

  const onMessage = (event: MessageEvent) => {
    const message = messageSchema.safeParse(event.data);
    if (message.success) onEvent(message.data.type);
  };
  current.addEventListener("message", onMessage);
  return () => {
    current.removeEventListener("message", onMessage);
  };
}
