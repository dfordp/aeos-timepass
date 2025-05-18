"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface VideoPageProps {
  params: {
    id: string;
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-4xl mx-auto">
        {/* Title and Controls Section */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Video Title</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <video
            className="absolute top-0 left-0 w-full h-full"
            controls
            autoPlay
            src={`/Radiohead - Creep.mp4`}
            poster={`/thumbnails/video${params.id}-thumb.jpg`}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}