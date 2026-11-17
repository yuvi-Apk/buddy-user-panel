// Dev builds only: sign in as any of the 4 roles with a fake session held in memory, to check
// each role's home, tabs and access rules without a backend. Nothing is sent to the server, so
// screens that call the API will get a 401 and sign the fake session out.
import { LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { Page, PageHeader, Section, Inline, Stack } from "@/components/layout";
import { Alert, Button, Card, CardContent } from "@/components/ui";
import { getHomePathForRole, ROLE_LABEL_KEYS } from "@/config/navigation";
import { textAt, useLang } from "@/lang";
import { USER_ROLES, type UserRole } from "@/auth/roles";
import { endLocalSession, signIn } from "@/auth/session";
import type { SessionUser } from "@/auth/session-store";
import { useSession } from "@/auth/session-store";

const organization = {
  id: "dev-organization",
  name: "Sunrise Public School",
  type: "SCHOOL",
};

const FAKE_USERS: Record<UserRole, SessionUser> = {
  INDIVIDUAL: {
    id: "dev-individual",
    name: "Asha Verma",
    email: "asha@example.com",
    role: "INDIVIDUAL",
    examCategory: "GOVERNMENT_EXAM",
    avatarUrl: null,
    organization: null,
    pendingRequest: null,
  },
  STUDENT: {
    id: "dev-student",
    name: "Rohan Das",
    email: "rohan@example.com",
    role: "STUDENT",
    examCategory: "SCHOOL",
    avatarUrl: null,
    organization,
    pendingRequest: null,
  },
  TEACHER: {
    id: "dev-teacher",
    name: "Meera Iyer",
    email: "meera@example.com",
    role: "TEACHER",
    examCategory: null,
    avatarUrl: null,
    organization,
    pendingRequest: null,
  },
  ORGANIZATION_ADMIN: {
    id: "dev-organization-admin",
    name: "Vikram Singh",
    email: "vikram@example.com",
    role: "ORGANIZATION_ADMIN",
    examCategory: null,
    avatarUrl: null,
    organization,
    pendingRequest: null,
  },
};

export function DevSessionPage() {
  const lang = useLang();
  const navigate = useNavigate();
  const user = useSession((session) => session.user);

  const signInAs = (role: UserRole) => {
    signIn({ accessToken: `dev-session-${role}`, user: FAKE_USERS[role] });
    void navigate(getHomePathForRole(role));
  };

  return (
    <Page width="reading">
      <PageHeader
        title="Dev sessions"
        description="Sign in as any role with a fake session in memory. Dev builds only."
      />
      <Alert variant="default" title="Nothing reaches the server">
        Screens that call the API will get a 401 and sign this fake session out.
      </Alert>
      <Section title="Sign in as">
        <Stack gap={3}>
          {USER_ROLES.map((role) => (
            <Card key={role}>
              <CardContent>
                <Inline justify="between" gap={3}>
                  <Stack gap={0}>
                    <span className="font-semibold">
                      {textAt(lang, ROLE_LABEL_KEYS[role])}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {FAKE_USERS[role].name} · lands on{" "}
                      {getHomePathForRole(role)}
                    </span>
                  </Stack>
                  <Button
                    variant={user?.role === role ? "default" : "outline"}
                    onClick={() => {
                      signInAs(role);
                    }}
                  >
                    <UserRound aria-hidden />
                    {user?.role === role ? "Signed in" : "Sign in"}
                  </Button>
                </Inline>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Section>
      {user ? (
        <Button
          variant="ghost"
          onClick={() => {
            endLocalSession();
            void navigate("/login");
          }}
        >
          <LogOut aria-hidden />
          Sign out of the fake session
        </Button>
      ) : null}
    </Page>
  );
}
