// Dialogs, menus, tooltips and the top bar's light / dark switch.
import { CircleUser, Info, LogOut, Settings } from "lucide-react";
import { Inline, ThemeToggle } from "@/components/layout";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="font-semibold">
            Asha Rao
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <CircleUser aria-hidden />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings aria-hidden />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle />

      <Tooltip content="Tooltips show on hover and keyboard focus only">
        <IconButton label="About tooltips" icon={<Info />} />
      </Tooltip>
    </Inline>
  );
}
