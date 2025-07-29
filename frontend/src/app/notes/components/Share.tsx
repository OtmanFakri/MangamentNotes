import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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

interface ShareNoteProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  emailInput: string;
  setEmailInput: (email: string) => void;
  handleShareWithUser: () => void;
  handleRemoveSharedUser: (userId: string) => void;
  handleCopyPublicLink: () => void;
  handleRevokePublicLink: () => void;
  handleGeneratePublicLink: () => void;
  isGeneratingLink: boolean;
}

export default function ShareNote({
  note,
  isOpen,
  onClose,
  emailInput,
  setEmailInput,
  handleShareWithUser,
  handleRemoveSharedUser,
  handleCopyPublicLink,
  handleRevokePublicLink,
  handleGeneratePublicLink,
  isGeneratingLink,
}: ShareNoteProps) {
    
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
              <h3 className="text-lg font-medium">Partager avec des utilisateurs</h3>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Entrez une adresse email"
                onKeyPress={(e) => e.key === "Enter" && handleShareWithUser()}
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
                <Label className="text-sm font-medium">Partagé avec :</Label>
                {note.sharedWith.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Lecture seule • Partagé le{" "}
                            {user.sharedAt.toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSharedUser(user.id)}
                        title="Révoquer l'accès"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </CardContent>
                  </Card>
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
              Créez un lien public pour permettre à quiconque ayant le lien de consulter cette note.
            </p>

            {note.publicUrl ? (
              <div className="space-y-3">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center gap-2 p-3">
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
                  <Button onClick={handleCopyPublicLink} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copier
                  </Button>
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
                <li>• Les utilisateurs partagés peuvent uniquement consulter la note</li>
                <li>• Les liens publics permettent l'accès en lecture seule</li>
                <li>• Vous pouvez révoquer l'accès à tout moment</li>
                <li>• Les modifications ne sont visibles qu'après sauvegarde</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}