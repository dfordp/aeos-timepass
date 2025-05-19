"use client";

import { VideoCard } from "@/components/video-card";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  name: string;
  thumbnailURL: string;
  videoURL: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/video?userId=${user?.id}`);
        setVideos(data.data );
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchVideos();
    }
  }, [user?.id]);


  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No videos found. Upload your first video to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.name}
              thumbnailUrl={video.thumbnailURL}
              downloadUrl={video.videoURL}
            />
          ))}
        </div>
      )}
    </div>
  );
}