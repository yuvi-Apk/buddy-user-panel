// http-request: file uploads (FormData bodies) and which image URLs the app may show.
import { http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { getOwnImageUrl, sendHttpRequest } from "@/api/http-request";
import { apiPath, successResponse } from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";

describe("sendHttpRequest: bodies", () => {
  it("sends a FormData body as multipart, not as JSON", async () => {
    let contentType: string | null = null;
    let image: FormDataEntryValue | null = null;
    server.use(
      http.put(apiPath("/user/auth/me/avatar"), async ({ request }) => {
        contentType = request.headers.get("Content-Type");
        image = (await request.formData()).get("image");
        return successResponse(null);
      })
    );

    const body = new FormData();
    body.append("image", new File(["photo"], "me.png", { type: "image/png" }));
    await sendHttpRequest("PUT", "/user/auth/me/avatar", z.null(), { body });

    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(image).toHaveProperty("type", "image/png");
  });

  it("still sends other bodies as JSON", async () => {
    let contentType: string | null = null;
    let received: unknown = null;
    server.use(
      http.patch(apiPath("/user/auth/me"), async ({ request }) => {
        contentType = request.headers.get("Content-Type");
        received = await request.json();
        return successResponse(null);
      })
    );

    await sendHttpRequest("PATCH", "/user/auth/me", z.null(), {
      body: { name: "Asha" },
    });

    expect(contentType).toBe("application/json");
    expect(received).toEqual({ name: "Asha" });
  });
});

describe("getOwnImageUrl", () => {
  afterEach(() => {
    vi.doUnmock("@/config/env");
    vi.resetModules();
  });

  it("keeps our backend's image paths, on the same site", () => {
    expect(getOwnImageUrl("/images/profile/a.webp")).toBe(
      "/images/profile/a.webp"
    );
  });

  it("never gives a photo from another site, or none", () => {
    expect(
      getOwnImageUrl("https://lh3.googleusercontent.com/a/photo")
    ).toBeUndefined();
    expect(getOwnImageUrl("/api/v1/user/auth/me")).toBeUndefined();
    expect(getOwnImageUrl(null)).toBeUndefined();
  });

  it("points at the API's site when the API is on another one", async () => {
    vi.resetModules();
    vi.doMock("@/config/env", () => ({
      env: { apiBaseUrl: "https://api.example.com/api/v1" },
    }));
    const { getOwnImageUrl: getUrl } = await import("@/api/http-request");

    expect(getUrl("/images/profile/a.webp")).toBe(
      "https://api.example.com/images/profile/a.webp"
    );
  });
});
