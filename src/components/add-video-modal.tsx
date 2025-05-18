"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
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

// Types
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (videoId: string) => void;
}

interface VideoMetadata {
  duration: number;
  resolution: string;
}

interface CreateVideoResponse {
  success: boolean;
  data: {
    id: string;
    [key: string]: unknown;
  };
}

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  // State
  const { user } = useUser();
  const userId = user?.id;
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video metadata extraction
  const getVideoMetadata = async (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.floor(video.duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Form reset
  const resetForm = () => {
    setFile(null);
    setName("");
    setProgress(0);
    setStatus("");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // File selection handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (500MB limit)
    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 500MB");
      return;
    }

    // Validate file type
    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    setFile(selectedFile);
    setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    toast.success("File selected successfully");
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file || !name.trim() || !userId) {
      toast.error("Please provide both a name and a file");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Create video entry (0-20%)
      setStatus("Analyzing video...");
      setProgress(10);
      
      const metadata = await getVideoMetadata(file);
      
      setStatus("Creating video entry...");
      const { data: videoResponse } = await axios.post<CreateVideoResponse>('/api/video', {
        userId,
        name: name.trim(),
        fileSize: file.size,
        type: file.type,
        duration: metadata.duration,
        resolution: metadata.resolution
      });

      const videoId = videoResponse.data.id;
      setProgress(20);

      // Step 2: Upload video file (20-80%)
      setStatus("Uploading video file...");
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`/api/video/${videoId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progressPercent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 60
            );
            setProgress(20 + progressPercent);
          }
        },
      });

      setProgress(80);

      // Step 3: Generate thumbnail (80-100%)
      setStatus("Processing video...");
      await axios.post(`/api/video/${videoId}/thumbnail`);

      setProgress(100);
      toast.success("Video uploaded successfully!");
      onUploadComplete?.(videoId);
      resetForm();
      onClose();

    } catch (error) {
      console.error("Upload error:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Upload failed';
        toast.error(errorMessage);
      } else {
        toast.error("Failed to upload video");
      }
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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{status}</span>
                <span>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
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