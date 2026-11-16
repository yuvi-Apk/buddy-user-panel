// Dialogs and tooltips.
import { Info } from "lucide-react";
import { Inline } from "@/components/layout";
import {
  Button,
  IconButton,
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
  Input,
  Tooltip,
} from "@/components/ui";

export function GalleryOverlays() {
  return (
    <Inline gap={2}>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent
          title="Join an Organization"
          description="Ask your school, college or coaching centre for its code."
          footer={
            <>
              <ResponsiveDialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </ResponsiveDialogClose>
              <Button>Send request</Button>
            </>
          }
        >
          <Input label="Organization code" placeholder="AB12CD" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <Tooltip content="Tooltips show on hover and keyboard focus only">
        <IconButton label="About tooltips" icon={<Info />} />
      </Tooltip>
    </Inline>
  );
}
