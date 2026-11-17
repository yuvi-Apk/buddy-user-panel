// A button that opens the device's file picker: the way modules let a person choose a file
// (they never use a raw <input>). It takes every Button prop: variant, size, loading.
//
//   <FileButton accept="image/jpeg,image/png" onFileSelect={upload} loading={isUploading}>
//     {lang.profile.changePhoto}
//   </FileButton>
import { useRef } from "react";
import { Button, type ButtonProps } from "./button";

export interface FileButtonProps extends Omit<
  ButtonProps,
  "onClick" | "asChild"
> {
  /** The file types the picker offers, as for <input accept>: "image/png,image/webp". */
  accept?: string;
  /** Called with the chosen file. Choosing the same file again calls it again. */
  onFileSelect: (file: File) => void;
}

export function FileButton({
  accept,
  onFileSelect,
  loading,
  ...props
}: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        data-slot="file-button"
        loading={loading}
        onClick={() => inputRef.current?.click()}
        {...props}
      />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        tabIndex={-1}
        aria-hidden
        data-slot="file-button-input"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          // Cleared, so picking the same file again still fires a change.
          event.currentTarget.value = "";
          if (file && !loading) onFileSelect(file);
        }}
      />
    </>
  );
}
