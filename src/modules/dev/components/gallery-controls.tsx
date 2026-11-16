// Buttons, fields, choices and a working form, in every variant.
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Inline, Stack } from "@/components/layout";
import {
  Button,
  IconButton,
  Checkbox,
  ChoiceCardGroup,
  Form,
  SubmitButton,
  RadioGroup,
  SegmentedControl,
  SelectField,
  Switch,
  TextArea,
  Input,
  toast,
} from "@/components/ui";

const VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
] as const;
const SIZES = ["sm", "default", "lg"] as const;

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
      <Input label="Your name" placeholder="Asha Verma" autoComplete="name" />
      <Input label="With a hint" hint="This is how teachers will see you." />
      <Input
        label="Required, with an error"
        isRequired
        error="Write at least 2 letters."
      />
      <Input label="Disabled" disabled defaultValue="Can't change this" />
      <Input type="email" label="Email" placeholder="asha@example.com" />
      <Input type="password" label="Password" hint="At least 8 characters." />
      <Input
        type="search"
        label="Search topics"
        placeholder="Algebra, Optics…"
      />
      <Input type="date" label="Exam date" />
      <Input label="Organization code" placeholder="AB12CD" />
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
    toast({ title: `Welcome, ${values.name}!`, variant: "success" });
    form.reset();
  }

  return (
    <Form form={form} onSubmit={submit} className="max-w-md">
      <Input
        label="Your name"
        isRequired
        autoComplete="name"
        {...form.register("name")}
        error={errors.name?.message}
      />
      <Input
        type="email"
        label="Email"
        isRequired
        {...form.register("email")}
        error={errors.email?.message}
      />
      <Input
        type="password"
        label="Password"
        isRequired
        autoComplete="new-password"
        hint="At least 8 characters."
        {...form.register("password")}
        error={errors.password?.message}
      />
      <SubmitButton>Create account</SubmitButton>
    </Form>
  );
}
