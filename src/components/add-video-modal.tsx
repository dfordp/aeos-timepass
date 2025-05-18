"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setName("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file size (500MB limit)
    if (selectedFile.size > 500 * 1024 * 1024) {
      toast.error("File size must be less than 500MB");
      return;
    }

    // Validate file type
    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    setFile(selectedFile);
    // Set default name from filename without extension
    setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      toast.error("Please provide both a name and a file");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      xhr.upload.addEventListener("load", () => {
        setUploadProgress(100);
      });

      return new Promise((resolve, reject) => {
        xhr.open("POST", "/api/upload");
        
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              toast.success("Video uploaded successfully");
              resetForm();
              onClose();
              resolve(response);
            } else {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video file (max 500MB). Supported formats: MP4, WebM, MOV.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Video Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter video name"
              disabled={uploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || !name.trim() || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}