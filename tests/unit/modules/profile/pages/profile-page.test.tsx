// The profile page: change your name, upload and remove your photo.
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { describe, expect, it } from "vitest";
import { getCurrentSession } from "@/auth/session-store";
import { USER_ROLES } from "@/auth/roles";
import { getLang } from "@/lang";
import {
  apiPath,
  errorResponse,
  makeUser,
  successResponse,
  validationFailed,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();
const PHOTO_URL = "/images/profile/new.webp";

/** The profile page loads its code first: slower than one second on a busy run. */
async function openProfile(options: Parameters<typeof renderRoute>[1] = {}) {
  const result = renderRoute("/profile", { as: "STUDENT", ...options });
  await screen.findByRole(
    "heading",
    { level: 1, name: lang.nav.profile },
    { timeout: 3000 }
  );
  return result;
}

function getPhotoInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(
    '[data-slot="file-button-input"]'
  );
  if (!input) throw new Error("No photo input.");
  return input;
}

function backendUser(overrides: { name?: string; avatarUrl?: string | null }) {
  const { id, email, examCategory, name, avatarUrl } = makeUser(overrides);
  return { id, email, examCategory, name, avatarUrl };
}

describe("ProfilePage", () => {
  it.each(USER_ROLES)("shows %s their name and email", async (role) => {
    await openProfile({ as: role, user: { name: "Asha Rao" } });

    expect(
      screen.getByRole("textbox", { name: lang.profile.nameLabel })
    ).toHaveValue("Asha Rao");
    expect(
      screen.getByRole("textbox", { name: lang.profile.emailLabel })
    ).toHaveValue("asha@example.com");
    expect(
      screen.getByRole("button", { name: lang.profile.changePhoto })
    ).toBeVisible();
  });

  it("saves a new name and shows it everywhere at once", async () => {
    let sentBody: unknown = null;
    server.use(
      http.patch(apiPath("/user/auth/me"), async ({ request }) => {
        sentBody = await request.json();
        return successResponse(backendUser({ name: "Asha Kumari" }));
      })
    );
    const user = userEvent.setup();
    await openProfile({ user: { name: "Asha Rao" } });

    const save = screen.getByRole("button", { name: lang.profile.save });
    expect(save).toBeDisabled();
    const name = screen.getByRole("textbox", { name: lang.profile.nameLabel });
    await user.clear(name);
    await user.type(name, "  Asha Kumari ");
    await user.click(save);

    expect(await screen.findByText(lang.profile.nameSaved)).toBeVisible();
    expect(sentBody).toEqual({ name: "Asha Kumari" });
    expect(getCurrentSession().user).toMatchObject({
      name: "Asha Kumari",
      role: "STUDENT",
    });
    await user.click(
      screen.getByRole("button", { name: lang.nav.accountMenu })
    );
    expect(await screen.findByRole("menu")).toHaveTextContent("Asha Kumari");
  });

  it("asks for a name before sending anything", async () => {
    let requests = 0;
    server.use(
      http.patch(apiPath("/user/auth/me"), () => {
        requests += 1;
        return successResponse(backendUser({}));
      })
    );
    const user = userEvent.setup();
    await openProfile();

    await user.clear(
      screen.getByRole("textbox", { name: lang.profile.nameLabel })
    );
    await user.type(
      screen.getByRole("textbox", { name: lang.profile.nameLabel }),
      "   "
    );
    await user.click(screen.getByRole("button", { name: lang.profile.save }));

    expect(await screen.findByText(lang.profile.nameRequired)).toBeVisible();
    expect(requests).toBe(0);
  });

  it("shows the backend's error under the name", async () => {
    server.use(
      http.patch(apiPath("/user/auth/me"), () =>
        validationFailed({ name: "That name is not allowed" })
      )
    );
    const user = userEvent.setup();
    await openProfile();

    const name = screen.getByRole("textbox", { name: lang.profile.nameLabel });
    await user.clear(name);
    await user.type(name, "Someone else");
    await user.click(screen.getByRole("button", { name: lang.profile.save }));

    expect(await screen.findByText("That name is not allowed")).toBeVisible();
  });

  it("uploads a photo as multipart, then offers to remove it", async () => {
    let image: FormDataEntryValue | null = null;
    server.use(
      http.put(apiPath("/user/auth/me/avatar"), async ({ request }) => {
        image = (await request.formData()).get("image");
        return successResponse(backendUser({ avatarUrl: PHOTO_URL }));
      })
    );
    const user = userEvent.setup();
    await openProfile();
    expect(
      screen.queryByRole("button", { name: lang.profile.removePhoto })
    ).not.toBeInTheDocument();

    await user.upload(
      getPhotoInput(),
      new File(["photo"], "me.png", { type: "image/png" })
    );

    expect(await screen.findByText(lang.profile.photoUpdated)).toBeVisible();
    expect(image).toHaveProperty("type", "image/png");
    expect(getCurrentSession().user?.avatarUrl).toBe(PHOTO_URL);
    expect(
      screen.getByRole("button", { name: lang.profile.removePhoto })
    ).toBeVisible();
  });

  it("says why a file is refused, and sends nothing", async () => {
    let requests = 0;
    server.use(
      http.put(apiPath("/user/auth/me/avatar"), () => {
        requests += 1;
        return successResponse(backendUser({}));
      })
    );
    // applyAccept off: a person can still pick "All files" in the picker.
    const user = userEvent.setup({ applyAccept: false });
    await openProfile();

    await user.upload(
      getPhotoInput(),
      new File(["%PDF"], "notes.pdf", { type: "application/pdf" })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      lang.profile.photoWrongType
    );

    const tooBig = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(tooBig, "size", { value: 5 * 1024 * 1024 + 1 });
    await user.upload(getPhotoInput(), tooBig);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      lang.profile.photoTooBig
    );
    expect(requests).toBe(0);
  });

  it("shows the backend's message when the upload fails", async () => {
    server.use(
      http.put(apiPath("/user/auth/me/avatar"), () =>
        errorResponse(
          409,
          "Your photo was changed at the same time. Try again."
        )
      )
    );
    const user = userEvent.setup();
    await openProfile();

    await user.upload(
      getPhotoInput(),
      new File(["photo"], "me.png", { type: "image/png" })
    );

    expect(
      await screen.findByText(
        "Your photo was changed at the same time. Try again."
      )
    ).toBeVisible();
    expect(getCurrentSession().user?.avatarUrl).toBeNull();
  });

  it("removes the photo", async () => {
    server.use(
      http.delete(apiPath("/user/auth/me/avatar"), () =>
        successResponse(backendUser({ avatarUrl: null }))
      )
    );
    const user = userEvent.setup();
    await openProfile({ user: { avatarUrl: PHOTO_URL } });

    await user.click(
      screen.getByRole("button", { name: lang.profile.removePhoto })
    );

    expect(await screen.findByText(lang.profile.photoRemoved)).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: lang.profile.removePhoto })
      ).not.toBeInTheDocument();
    });
    expect(getCurrentSession().user?.avatarUrl).toBeNull();
  });

  it("does not offer to remove a Google photo it does not show", async () => {
    await openProfile({
      user: { avatarUrl: "https://lh3.googleusercontent.com/a/photo" },
    });
    const main = within(screen.getByRole("main"));
    expect(
      main.queryByRole("button", { name: lang.profile.removePhoto })
    ).not.toBeInTheDocument();
  });
});
