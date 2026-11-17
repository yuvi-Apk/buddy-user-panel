// The person's name (1 to 80 characters, as the backend allows) and their Google email, which
// cannot be changed. Save is off until the name changes; the backend's field errors appear
// under the field by themselves (Form).
//   <ProfileNameForm user={user} />
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { SessionUser } from "@/auth/session-store";
import {
  Card,
  CardContent,
  Form,
  Input,
  SubmitButton,
  toast,
} from "@/components/ui";
import { fill, useLang } from "@/lang";
import { MAX_NAME_LENGTH, useUpdateName } from "../api/profile";

export function ProfileNameForm({ user }: { user: SessionUser }) {
  const lang = useLang();
  const updateName = useUpdateName();

  const nameSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, lang.profile.nameRequired)
      .max(
        MAX_NAME_LENGTH,
        fill(lang.profile.nameTooLong, { max: String(MAX_NAME_LENGTH) })
      ),
  });

  const form = useForm<
    z.input<typeof nameSchema>,
    unknown,
    z.output<typeof nameSchema>
  >({
    resolver: zodResolver(nameSchema),
    values: { name: user.name },
  });
  const name = useWatch({ control: form.control, name: "name" });
  const isUnchanged = name.trim() === user.name;

  return (
    <Card>
      <CardContent>
        <Form
          form={form}
          onSubmit={async (values) => {
            await updateName.mutateAsync(values);
            toast({ title: lang.profile.nameSaved, variant: "success" });
          }}
        >
          <Input
            label={lang.profile.nameLabel}
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            isRequired
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Input
            type="email"
            label={lang.profile.emailLabel}
            hint={lang.profile.emailHint}
            value={user.email}
            readOnly
          />
          <SubmitButton className="self-start" disabled={isUnchanged}>
            {lang.profile.save}
          </SubmitButton>
        </Form>
      </CardContent>
    </Card>
  );
}
