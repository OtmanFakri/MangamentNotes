import { Note } from "@/app/types";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface NoteFormProps {
  note?: Note;
  open: boolean;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onCancel: () => void;
}

export function NoteForm({ note, open, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = React.useState(note?.title || '');
  const [content, setContent] = React.useState(note?.content || '');
  const [tags, setTags] = React.useState(note?.tags?.join(', ') || '');
  const [visibility, setVisibility] = React.useState<Note['visibility']>(note?.visibility || 'private');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      visibility,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent className="max-w-2xl">
        <DialogHeader>
            <DialogTitle>{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
            <DialogDescription>
            {note ? 'Update your note details below.' : 'Fill in the details to create a new note.'}
            </DialogDescription>
        </DialogHeader>
        <form className='space-y-6' onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter note title..."
                required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your note content here..."
                className="min-h-[120px] resize-none"
                required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                />
                <p className="text-sm text-muted-foreground">
                Separate tags with commas
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value: Note['visibility']) => setVisibility(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="private">🔒 Private</SelectItem>
                    <SelectItem value="shared">👥 Shared</SelectItem>
                    <SelectItem value="public">🌍 Public</SelectItem>
                </SelectContent>
                </Select>
            </div>
               <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button type="submit">
                {note ? 'Update Note' : 'Create Note'}
            </Button>
        </DialogFooter>
        </form>
        </DialogContent>
  </Dialog>
  );
}