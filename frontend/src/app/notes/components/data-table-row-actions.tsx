"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { labels } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteForm } from "./NoteFrom";
import { useEffect, useState } from "react";
import { Note } from "@/app/types";
import ShareNote from "./Share";
import { toast } from "sonner";
import { deleteNote } from "@/app/service/api";
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const label = (row.original as any).label ?? "";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-muted size-8"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={label || (row.original as any).tags?.[0]}
              >
                {(row.original as any).tags?.map((tag: string) => (
                  <DropdownMenuRadioItem key={tag} value={tag}>
                    {tag}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              const id = (row.original as Note).id;
              const success = await deleteNote(id);
              if (success) {
                toast.success("Note deleted successfully!");
              } else {
                toast.error("Failed to delete the note.");
              }
            }}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NoteForm
        note={row.original as Note}
        open={isDialogOpen}
        onSave={(data) => {
          console.log("Saving note:", data);
          setIsDialogOpen(false);
        }}
        onCancel={() => setIsDialogOpen(false)}
      />

      <ShareNote
        note={row.original as Note}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        emailInput={""}
        setEmailInput={() => {}}
        handleShareWithUser={() => {}}
        handleRemoveSharedUser={() => {}}
        handleCopyPublicLink={() => {}}
        handleRevokePublicLink={() => {}}
        handleGeneratePublicLink={() => {}}
        isGeneratingLink={false}
      />
    </>
  );
}
