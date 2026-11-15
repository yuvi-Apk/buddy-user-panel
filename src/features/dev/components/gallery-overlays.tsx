// Dialogs, menus, popovers, tooltips and tabs.
import { Ellipsis, Info, LogOut, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Inline } from "@/components/layout/stack";
import { Button, IconButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast-store";
import { Tooltip } from "@/components/ui/tooltip";

export function GalleryOverlays() {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
          <TextField label="Organization code" placeholder="AB12CD" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
        Confirm dialog
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="destructive"
        title="Remove this student?"
        description="They will lose access to the Organization's plans. You can invite them again later."
        confirmLabel="Remove"
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          toast({ title: "Student removed" });
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            label="More actions"
            variant="outline"
            icon={<Ellipsis />}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Class 10 A</DropdownMenuLabel>
          <DropdownMenuItem icon={<Pencil />}>Rename</DropdownMenuItem>
          <DropdownMenuItem icon={<LogOut />}>Leave</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="destructive" icon={<Trash2 />}>
            Delete class
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost">Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="font-semibold">How streaks work</p>
          <p className="text-sm text-muted-foreground">
            Finish at least one task a day to keep your streak going.
          </p>
        </PopoverContent>
      </Popover>

      <Tooltip content="Tooltips show on hover and keyboard focus only">
        <IconButton label="About tooltips" icon={<Info />} />
      </Tooltip>
    </Inline>
  );
}

export function GalleryTabs() {
  return (
    <Tabs defaultValue="week">
      <TabsList>
        <TabsTrigger value="week">This week</TabsTrigger>
        <TabsTrigger value="topics">All topics</TabsTrigger>
        <TabsTrigger value="tests">Mock tests</TabsTrigger>
      </TabsList>
      <TabsContent value="week">Your plan for this week goes here.</TabsContent>
      <TabsContent value="topics">
        Every topic with how you're doing.
      </TabsContent>
      <TabsContent value="tests">Past mock tests and scores.</TabsContent>
    </Tabs>
  );
}
