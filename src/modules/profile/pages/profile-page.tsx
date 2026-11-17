// The person's own profile: their photo, their name and their email.
import { useSession } from "@/auth/session-store";
import { Page, PageHeader, Section } from "@/components/layout";
import { useLang } from "@/lang";
import { ProfileNameForm } from "../components/profile-name-form";
import { ProfilePhotoCard } from "../components/profile-photo-card";

export function ProfilePage() {
  const lang = useLang();
  const user = useSession((session) => session.user);
  // The route opens only for a signed-in person; this keeps TypeScript sure of it.
  if (!user) return null;

  return (
    <Page>
      <PageHeader
        title={lang.nav.profile}
        description={lang.profile.description}
      />
      <Section
        variant="split"
        title={lang.profile.photoTitle}
        description={lang.profile.photoDescription}
      >
        <ProfilePhotoCard user={user} />
      </Section>
      <Section
        variant="split"
        title={lang.profile.detailsTitle}
        description={lang.profile.detailsDescription}
      >
        <ProfileNameForm user={user} />
      </Section>
    </Page>
  );
}
