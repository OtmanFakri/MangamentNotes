import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Mail,
  Trash2,
  Globe,
  Check,
  Copy,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { Note } from "@/app/types";
import { toast } from "sonner";
import { generatePublicLink, shareNote } from "@/app/service/api";
import { useState } from "react";

interface ShareNoteProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  handleRemoveSharedUser: (userId: string) => void;
  handleCopyPublicLink: () => void;
  handleRevokePublicLink: () => void;
}

export default function ShareNote({
  note,
  isOpen,
  onClose,

  handleRemoveSharedUser,
  handleCopyPublicLink,
  handleRevokePublicLink,
}: ShareNoteProps) {
    
  const [emailInput, setEmailInput] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleShareWithUser = () => {
    if (!emailInput.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    shareNote({ note_id: note.id, shared_with_user_email: emailInput.trim() })
      .then((success) => {
        if (success) {
          toast.success("Note shared successfully!");
          setEmailInput("");
        } else {
          toast.error("Failed to share the note.");
        }
      })
      .catch(() => {
        toast.error("An error occurred while sharing the note.");
      });
  };

   const handleGeneratePublicLink = async () => {
    setIsGeneratingLink(true);
    try {
      const result = await generatePublicLink({ note_id: note.id });
      if (result && result.publicUrl) {
        toast.success("Public link generated!");
      } else {
        toast.error("Failed to generate public link.");
      }
    } catch {
      toast.error("An error occurred while generating the public link.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Partager "{note.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Partage avec des utilisateurs spécifiques */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-medium">
                Partager avec des utilisateurs
              </h3>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Entrez une adresse email"
              />
              <Button
                onClick={handleShareWithUser}
                disabled={!emailInput.trim()}
              >
                Partager
              </Button>
            </div>

            {/* Liste des utilisateurs avec qui la note est partagée */}
            {note.sharedWith && note.sharedWith.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Partagé avec :</h4>
                {note.sharedWith.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Lecture seule • Partagé le   {user.shared_at && new Date(user.shared_at).toLocaleDateString("fr-FR")}

                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSharedUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Révoquer l'accès"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lien public */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-medium">Lien public</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Créez un lien public pour permettre à quiconque ayant le lien de
              consulter cette note.
            </p>

            {note.publicUrl ? (
              <div className="space-y-3">
                <Card  className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center gap-1">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Lien public actif
                    </span>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={note.publicUrl}
                    readOnly
                    className="flex-1"
                  />
                </div>

                <Button
                  variant="destructive"
                  onClick={handleRevokePublicLink}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Révoquer le lien public
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGeneratePublicLink}
                disabled={isGeneratingLink}
                className="flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                {isGeneratingLink ? "Génération..." : "Générer un lien public"}
              </Button>
            )}
          </div>
           
          {/* Informations sur les permissions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                À propos des permissions
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Les utilisateurs partagés peuvent uniquement consulter la
                  note
                </li>
                <li>• Les liens publics permettent l'accès en lecture seule</li>
                <li>• Vous pouvez révoquer l'accès à tout moment</li>
                <li>
                  • Les modifications ne sont visibles qu'après sauvegarde
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
