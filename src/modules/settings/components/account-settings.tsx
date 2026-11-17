// Settings → Your account: sign out of every device, after a confirmation. For a shared or lost
// phone. If the server can't be reached, a toast says so and this device stays signed in.
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { signOutEverywhere } from "@/auth/session";
import { Section } from "@/components/layout";
import {
  Button,
  Card,
  CardContent,
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui";
import { LOGIN_PATH } from "@/config/navigation";
import { useLang } from "@/lang";

export function AccountSettings() {
  const lang = useLang();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const signOutAll = useMutation({
    mutationFn: signOutEverywhere,
    onSuccess: () => {
      void navigate(LOGIN_PATH, { replace: true });
    },
  });

  return (
    <Section
      variant="split"
      title={lang.account.title}
      description={lang.account.description}
    >
      <Card>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground">
            {lang.account.signOutEverywhereBody}
          </p>
          <ResponsiveDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
          >
            <ResponsiveDialogTrigger asChild>
              <Button variant="outline">
                <LogOut aria-hidden />
                {lang.account.signOutEverywhere}
              </Button>
            </ResponsiveDialogTrigger>
            <ResponsiveDialogContent
              title={lang.account.signOutEverywhere}
              description={lang.account.signOutEverywhereBody}
              footer={
                <>
                  <ResponsiveDialogClose asChild>
                    <Button variant="outline">{lang.common.cancel}</Button>
                  </ResponsiveDialogClose>
                  <Button
                    variant="destructive"
                    loading={signOutAll.isPending}
                    onClick={() => {
                      signOutAll.mutate(undefined, {
                        onError: () => {
                          setIsConfirmOpen(false);
                        },
                      });
                    }}
                  >
                    {lang.account.signOutEverywhereConfirm}
                  </Button>
                </>
              }
            />
          </ResponsiveDialog>
        </CardContent>
      </Card>
    </Section>
  );
}
