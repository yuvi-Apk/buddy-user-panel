// A form wired to React Hook Form and Zod.
//
//   const form = useForm<Values>({ resolver: zodResolver(schema) });
//   <Form form={form} onSubmit={save}>
//     <Input type="email" label={lang.auth.email} {...form.register("email")}
//                 error={form.formState.errors.email?.message} />
//     <SubmitButton>{lang.auth.logIn}</SubmitButton>
//   </Form>
//
// When onSubmit fails with the backend's validation errors, each message appears under its field
// (see showBackendFieldErrors below). A screen does not need to do anything for that.
//
// The browser's own validation popups are off (noValidate): fields show our errors instead, and
// React Hook Form moves focus to the first invalid field.
import type { ComponentProps } from "react";
import {
  type FieldValues,
  FormProvider,
  type Path,
  type SubmitHandler,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";
import { isApiError } from "@/api/api-error";
import { getLang } from "@/lang";
import { cn } from "@/utils/cn";
import { Button, type ButtonProps } from "./button";
import { toast } from "./toast-store";

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
        data-slot="form"
        noValidate
        className={cn("flex flex-col gap-4", className)}
        onSubmit={(event) => {
          void form.handleSubmit(async (values, submitEvent) => {
            try {
              await onSubmit(values, submitEvent);
            } catch (error) {
              if (!showBackendFieldErrors(form, error)) throw error;
            }
          })(event);
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * Puts the backend's validation errors ({ email: "This email is already used" }) under the
 * matching fields and focuses the first one. Returns false when the error has no field errors,
 * so the caller can let it go on (the query client shows those as a toast).
 *
 * An error for a field this form does not have is shown as a toast, so it is never lost.
 */
function showBackendFieldErrors<Values extends FieldValues>(
  form: UseFormReturn<Values>,
  error: unknown
): boolean {
  if (!isApiError(error) || !error.hasFieldErrors) return false;

  const formValues = form.getValues();
  let isFirstFieldError = true;
  const messagesWithoutField: string[] = [];

  for (const [fieldName, message] of Object.entries(error.fieldErrors)) {
    const topLevelName = fieldName.split(".")[0] ?? fieldName;
    if (!Object.hasOwn(formValues, topLevelName)) {
      messagesWithoutField.push(message);
      continue;
    }
    form.setError(
      fieldName as Path<Values>,
      { type: "server", message },
      { shouldFocus: isFirstFieldError }
    );
    isFirstFieldError = false;
  }

  if (messagesWithoutField.length > 0) {
    toast({
      title: getLang().errors.toastTitle,
      description: messagesWithoutField.join(" "),
      variant: "destructive",
    });
  }
  return true;
}

/** The form's submit button. Shows the busy state while the form is being sent. */
export function SubmitButton(props: Omit<ButtonProps, "type" | "loading">) {
  const { formState } = useFormContext();
  return <Button type="submit" loading={formState.isSubmitting} {...props} />;
}
