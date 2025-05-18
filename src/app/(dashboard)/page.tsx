import { VideoCard } from "@/components/video-card";

const videos = [
   {
    id: "1",
    title: "Introduction to Next.js",
    thumbnailUrl: "",
    downloadUrl: ""
  },
  {
    id: "2",
    title: "Building with React",
    thumbnailUrl: "",
    downloadUrl: ""
  },
];

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
            downloadUrl={video.downloadUrl}
          />
        ))}
      </div>
    </div>
  );
}