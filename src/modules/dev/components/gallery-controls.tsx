// Buttons, fields, choices and a working form, in every variant.
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Inline, Stack } from "@/components/layout/stack";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceCardGroup } from "@/components/ui/choice-card-group";
import { Form, SubmitButton } from "@/components/ui/form";
import { PasswordField } from "@/components/ui/password-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { TextArea } from "@/components/ui/text-area";
import {
  CodeField,
  DateField,
  EmailField,
  SearchField,
  TextField,
} from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast-store";

const VARIANTS = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
] as const;
const SIZES = ["sm", "md", "lg"] as const;

export function GalleryButtons() {
  return (
    <Stack gap={4}>
      {SIZES.map((size) => (
        <Inline key={size} gap={2}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
        </Inline>
      ))}
      <Inline gap={2}>
        <Button>
          <Plus aria-hidden />
          With icon
        </Button>
        <Button variant="outline">
          Next
          <ArrowRight aria-hidden />
        </Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <IconButton label="Settings" icon={<Settings />} />
        <IconButton label="Delete" variant="destructive" icon={<Trash2 />} />
      </Inline>
      <Button fullWidth size="lg">
        Full width (phones)
      </Button>
    </Stack>
  );
}

export function GalleryFields() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TextField
        label="Your name"
        placeholder="Asha Verma"
        autoComplete="name"
      />
      <TextField
        label="With a hint"
        hint="This is how teachers will see you."
      />
      <TextField
        label="Required, with an error"
        required
        error="Write at least 2 letters."
      />
      <TextField label="Disabled" disabled defaultValue="Can't change this" />
      <EmailField label="Email" placeholder="asha@example.com" />
      <PasswordField label="Password" hint="At least 8 characters." />
      <SearchField label="Search topics" placeholder="Algebra, Optics…" />
      <DateField label="Exam date" />
      <CodeField label="Organization code" placeholder="AB12CD" />
      <SelectField
        label="Exam"
        placeholder="Choose your exam"
        defaultValue=""
        options={[
          { value: "government", label: "Government exam" },
          { value: "school", label: "School board exam" },
          { value: "college", label: "College exam" },
        ]}
      />
      <TextArea
        label="Your doubt"
        hint="Ask in your own words. Add the question number if there is one."
        className="md:col-span-2"
      />
    </div>
  );
}

export function GalleryChoices() {
  const [studyTime, setStudyTime] = useState("evening");

  return (
    <Stack gap={6}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Checkbox
          label="Share my older progress"
          description="The Organization will see your past study plans and scores."
        />
        <Checkbox label="Disabled choice" disabled />
        <Switch
          label="Daily reminder"
          description="A nudge at your study time."
          defaultChecked
        />
        <Switch label="Weekly report by email" />
      </div>
      <RadioGroup
        label="How long can you study each day?"
        defaultValue="60"
        options={[
          { value: "30", label: "30 minutes" },
          {
            value: "60",
            label: "1 hour",
            description: "Most students start here.",
          },
          { value: "120", label: "2 hours or more" },
        ]}
      />
      <SegmentedControl
        label="Study time"
        value={studyTime}
        onValueChange={setStudyTime}
        options={[
          { value: "morning", label: "Morning" },
          { value: "evening", label: "Evening" },
          { value: "night", label: "Night" },
        ]}
      />
      <ChoiceCardGroup
        label="What are you preparing for?"
        defaultValue="government"
        options={[
          {
            value: "government",
            title: "Government exam",
            description: "SSC, banking, railways, state exams…",
          },
          {
            value: "school",
            title: "School",
            description: "Board exams and class tests.",
          },
          {
            value: "college",
            title: "College",
            description: "Semester exams and entrance tests.",
          },
          {
            value: "other",
            title: "Something else",
            description: "Tell us later.",
          },
        ]}
      />
    </Stack>
  );
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Write at least 2 letters."),
  email: z.email("Use an email like asha@example.com."),
  password: z.string().min(8, "Use at least 8 characters."),
});
type SignUpValues = z.infer<typeof signUpSchema>;

export function GalleryForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  async function submit(values: SignUpValues) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast({ title: `Welcome, ${values.name}!`, tone: "success" });
    form.reset();
  }

  return (
    <Form form={form} onSubmit={submit} className="max-w-md">
      <TextField
        label="Your name"
        required
        autoComplete="name"
        {...form.register("name")}
        error={errors.name?.message}
      />
      <EmailField
        label="Email"
        required
        {...form.register("email")}
        error={errors.email?.message}
      />
      <PasswordField
        label="Password"
        required
        autoComplete="new-password"
        hint="At least 8 characters."
        {...form.register("password")}
        error={errors.password?.message}
      />
      <SubmitButton>Create account</SubmitButton>
    </Form>
  );
}
