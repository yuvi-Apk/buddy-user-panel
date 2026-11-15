// A form wired to React Hook Form and Zod.
//
//   const form = useForm<Values>({ resolver: zodResolver(schema) });
//   <Form form={form} onSubmit={save}>
//     <EmailField label={lang.auth.email} {...form.register("email")}
//                 error={form.formState.errors.email?.message} />
//     <SubmitButton>{lang.auth.logIn}</SubmitButton>
//   </Form>
//
// The browser's own validation popups are off (noValidate): fields show our errors instead, and
// React Hook Form moves focus to the first invalid field.
import type { ComponentProps } from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "./button";

export interface FormProps<Values extends FieldValues> extends Omit<
  ComponentProps<"form">,
  "onSubmit"
> {
  form: UseFormReturn<Values>;
  onSubmit: SubmitHandler<Values>;
}

export function Form<Values extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
  ...props
}: FormProps<Values>) {
  return (
    <FormProvider {...form}>
      <form
        noValidate
        className={cn("flex flex-col gap-4", className)}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/** The form's submit button. Shows the busy state while the form is being sent. */
export function SubmitButton(props: Omit<ButtonProps, "type" | "loading">) {
  const { formState } = useFormContext();
  return <Button type="submit" loading={formState.isSubmitting} {...props} />;
}
