import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export type ExpiryPreset = '1h' | '12h' | '1d' | '30d' | 'forever';

interface ShareLinkFormData {
  visibility: "PUBLIC" | "PRIVATE";
  expiryPreset: ExpiryPreset;
  userEmails: string[];
}

interface ShareLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLink: () => Promise<void>;
  formData: ShareLinkFormData;
  setFormData: React.Dispatch<React.SetStateAction<ShareLinkFormData>>;

}

export function ShareLinkDialog({
  isOpen,
  onOpenChange,
  onCreateLink,
  formData,
  setFormData,
}: ShareLinkDialogProps) {
  const [newEmail, setNewEmail] = useState("");

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      if (!e.currentTarget.value.includes("@")) return;
      
      setFormData(prev => ({
        ...prev,
        userEmails: [...prev.userEmails, e.currentTarget.value]
      }));
      e.currentTarget.value = '';
    }
  };

  const handleRemoveEmail = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      userEmails: prev.userEmails.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) return;
    
    setFormData(prev => ({
      ...prev,
      userEmails: [...prev.userEmails, newEmail]
    }));
    setNewEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Share Link</DialogTitle>
          <DialogDescription>
            Create a new share link for your video. Set visibility and expiration options.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "PUBLIC" | "PRIVATE") => 
                setFormData(prev => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="PRIVATE">Private (Whitelist Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiry">Link Expiry</Label>
            <Select
              value={formData.expiryPreset}
              onValueChange={(value: ExpiryPreset) => 
                setFormData(prev => ({ ...prev, expiryPreset: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expiry time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="12h">12 hours</SelectItem>
                <SelectItem value="1d">1 day</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="forever">Never expires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.visibility === "PRIVATE" && (
            <div className="grid gap-2">
              <Label htmlFor="emails">Whitelisted Emails</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                />
                <Button size="sm" onClick={handleAddEmail}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.userEmails.map((email, index) => (
                  <Badge key={index} variant="secondary">
                    {email}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={() => handleRemoveEmail(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onCreateLink}
            disabled={!formData.visibility}
          >
            Create Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}