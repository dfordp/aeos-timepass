"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Video {
  id: string;
  name: string;
  thumbnailURL: string;
  videoURL: string;
  status: string;
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await axios.get(`/api/video/${params.id}`);
        console.log('Video data:', data);

        if (!data.data.videoURL) {
          toast.error('Video URL is missing');
          return;
        }

        setVideo(data.data);
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Video not found</h2>
          <Button 
            variant="ghost" 
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">{video.name}</h1>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.open(video.videoURL, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          {video.videoURL ? (
            <video
              className="absolute top-0 left-0 w-full h-full"
              controls
              playsInline
              preload="metadata"
              onError={(e) => {
                console.error('Video error:', e);
                setError('Failed to load video');
              }}
              poster={video.thumbnailURL || ''}
              key={video.videoURL}
            >
              <source src={video.videoURL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
              No video URL available
            </div>
          )}
          {error && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white bg-black bg-opacity-50">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}