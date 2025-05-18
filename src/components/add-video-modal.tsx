"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
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
import { bytesToSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

type UploadStage = 'METADATA' | 'UPLOAD' | 'PROCESSING';

interface UploadProgress {
  stage: UploadStage;
  progress: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (videoId: string) => void;
}

interface FileDetails {
  name: string;
  size: string;
  type: string;
  duration: string;
  dimensions: {
    width: number;
    height: number;
  } | null;
  lastModified: string;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const {user} = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [name, setName] = useState("");
  const [currentStage, setCurrentStage] = useState<UploadStage>("METADATA");
  const [progress, setProgress] = useState<Record<UploadStage, number>>({
    METADATA: 0,
    UPLOAD: 0,
    PROCESSING: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stages: { id: UploadStage; label: string; description: string }[] = [
    { id: "METADATA", label: "Preparing", description: "Preparing upload..." },
    { id: "UPLOAD", label: "Uploading", description: "Uploading video file..." },
    { id: "PROCESSING", label: "Processing", description: "Processing video..." }
  ];

  const resetForm = () => {
    setFile(null);
    setFileDetails(null);
    setName("");
    setCurrentStage("METADATA");
    setProgress({ METADATA: 0, UPLOAD: 0, PROCESSING: 0 });
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getVideoMetadata = async (file: File): Promise<{ duration: string; dimensions: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve({
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          dimensions: {
            width: video.videoWidth,
            height: video.videoHeight
          }
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 500 * 1024 * 1024) {
      toast.error("File size must be less than 500MB");
      return;
    }

    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    setFile(selectedFile);
    setName(selectedFile.name.replace(/\.[^/.]+$/, ""));

    const { duration, dimensions } = await getVideoMetadata(selectedFile);
    setFileDetails({
      name: selectedFile.name,
      size: bytesToSize(selectedFile.size),
      type: selectedFile.type,
      duration,
      dimensions,
      lastModified: new Date(selectedFile.lastModified).toLocaleString()
    });
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      toast.error("Please provide both a name and a file");
      return;
    }

    try {
      setIsUploading(true);

      // Stage 1: Metadata
      setCurrentStage("METADATA");
      setProgress(prev => ({ ...prev, METADATA: 50 }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("metadata", JSON.stringify(fileDetails));

      setProgress(prev => ({ ...prev, METADATA: 100 }));

      // Stage 2: Upload
      setCurrentStage("UPLOAD");

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const uploadProgress = Math.round((event.loaded * 100) / event.total);
            setProgress(prev => ({ ...prev, UPLOAD: uploadProgress }));
          }
        });

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", "/api/videos/upload");
        xhr.send(formData);
      });

      await uploadPromise;

      // Stage 3: Processing
      setCurrentStage("PROCESSING");
      setProgress(prev => ({ ...prev, PROCESSING: 100 }));

      toast.success("Video uploaded successfully");
      resetForm();
      onClose();

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) resetForm();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
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
              disabled={isUploading}
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
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>

          {fileDetails && (
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold">File Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{fileDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{fileDetails.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{fileDetails.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{fileDetails.duration}</span>
                </div>
                {fileDetails.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span>{fileDetails.dimensions.width}x{fileDetails.dimensions.height}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-6">
              {stages.map((stage) => (
                <div key={stage.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={cn(
                      "text-muted-foreground",
                      currentStage === stage.id && "text-primary font-medium"
                    )}>
                      {stage.label}
                    </span>
                    <span>{progress[stage.id]}%</span>
                  </div>
                  <Progress 
                    value={progress[stage.id]} 
                    className={cn(
                      "h-2",
                      currentStage === stage.id ? "opacity-100" : "opacity-50"
                    )}
                  />
                  {currentStage === stage.id && (
                    <p className="text-xs text-muted-foreground text-center">
                      {stage.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || !name.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}