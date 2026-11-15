---
paths:
  - "src/features/chat/**"
  - "src/features/study-plan/**"
  - "src/features/topics/**"
---

# AI features

These apply from the first AI screen (chat, study plan, topic analysis). The backend's matching
rules are in `backend/.claude/rules/ai.md`.

| #   | Rule                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | The browser never calls a model provider. Every AI call goes through our backend.                                                           |
| U2  | Heavy AI work (building a plan, analysing tests) is a background job: start it, show progress, then poll or stream. Never one long request. |
| U3  | Chat replies stream with `fetch` and a `ReadableStream`, not `EventSource`, which cannot send the `Authorization` header.                   |
| U4  | AI output is untrusted text: render it as text or markdown without raw HTML, and pass links through `safeUrl()` (core-rules #11).           |
| U5  | Show where an answer comes from (the backend returns sources), and say clearly when the tutor has no answer.                                |
| U6  | Every AI screen has states for: working (with progress), done, failed (with retry), and over the daily limit.                               |
| U7  | Send the model only what the feature needs. Never add names, emails or phone numbers to a prompt from the app.                              |
