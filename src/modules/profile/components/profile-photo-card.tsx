// The person's photo with Change and Remove. The file is checked here (type, size) before it is
// sent, so a wrong pick says why at once; the backend checks it again. Backend errors (a broken
// image, two uploads at once) show as a toast by themselves (query client).
//   <ProfilePhotoCard user={user} />
import { ImageUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { getOwnImageUrl } from "@/api/http-request";
import type { SessionUser } from "@/auth/session-store";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  FileButton,
  toast,
} from "@/components/ui";
import { ROLE_LABEL_KEYS } from "@/config/navigation";
import { textAt, useLang } from "@/lang";
import {
  MAX_PHOTO_BYTES,
  PHOTO_TYPES,
  useRemovePhoto,
  useUpdatePhoto,
} from "../api/profile";

const ACCEPTED_TYPES = PHOTO_TYPES.join(",");

function isAcceptedType(type: string): boolean {
  return PHOTO_TYPES.some((accepted) => accepted === type);
}

export function ProfilePhotoCard({ user }: { user: SessionUser }) {
  const lang = useLang();
  const updatePhoto = useUpdatePhoto();
  const removePhoto = useRemovePhoto();
  const [fileError, setFileError] = useState<string | null>(null);
  const photoUrl = getOwnImageUrl(user.avatarUrl);

  function uploadPhoto(file: File) {
    if (!isAcceptedType(file.type)) {
      setFileError(lang.profile.photoWrongType);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFileError(lang.profile.photoTooBig);
      return;
    }
    setFileError(null);
    updatePhoto.mutate(file, {
      onSuccess: () => {
        toast({ title: lang.profile.photoUpdated, variant: "success" });
      },
    });
  }

  function deletePhoto() {
    setFileError(null);
    removePhoto.mutate(undefined, {
      onSuccess: () => {
        toast({ title: lang.profile.photoRemoved });
      },
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={user.name} src={photoUrl} size="lg" />
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-lg font-semibold">
              {user.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {textAt(lang, ROLE_LABEL_KEYS[user.role])}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FileButton
              variant="outline"
              size="sm"
              accept={ACCEPTED_TYPES}
              loading={updatePhoto.isPending}
              disabled={removePhoto.isPending}
              onFileSelect={uploadPhoto}
            >
              <ImageUp aria-hidden />
              {lang.profile.changePhoto}
            </FileButton>
            {photoUrl ? (
              <Button
                variant="ghost"
                size="sm"
                loading={removePhoto.isPending}
                disabled={updatePhoto.isPending}
                onClick={deletePhoto}
              >
                <Trash2 aria-hidden />
                {lang.profile.removePhoto}
              </Button>
            ) : null}
          </div>
          {fileError ? (
            <p
              role="alert"
              className="text-sm text-destructive-soft-foreground"
            >
              {fileError}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang.profile.photoHint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
