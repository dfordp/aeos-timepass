"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { format } from "date-fns";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";



interface VideoData {
  id: string;
  name: string;
  videoURL: string;
  thumbnailURL: string;
  status: "PROCESSING" | "READY";
  fileSize: string;
  duration: number | null;
  mimeType: string | null;
  dimensions: {
    width: number;
    height: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}


// interface ShareLinkData {
//   id: string;
//   videoId: string;
//   creatorId: string;
//   visibility: "PUBLIC" | "PRIVATE";
//   expiresAt: string | null;
//   lastViewedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   userWhitelist: Array<{
//     id: string;
//     email: string;
//     name: string;
//   }>;
//   accesses: Array<{
//     id: string;
//     viewerEmail: string | null;
//     viewedAt: string;
//   }>;
// }

export default function VideoDetails() {
  const router = useRouter();
  const params = useParams<{ id: string;}>()
  const videoId = params.id;

  const [video, setVideo] = useState<VideoData | null>(null);
  // const [shareLinks, setShareLinks] = useState<ShareLinkData[]>([]);
  // const [isCreatingLink, setIsCreatingLink] = useState(false);
  // const [newEmail, setNewEmail] = useState("");
  // const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await axios.get(`/api/video/${videoId}`);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch video');
        }

        setVideo(data.data);
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load video');
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id, videoId]);


  // const handleCreateShareLink = (visibility: "PUBLIC" | "PRIVATE") => {
  //   const newLink: ShareLinkData = {
  //     id: `link${Date.now()}`,
  //     visibility,
  //     expiresAt: null,
  //     lastViewedAt: null,
  //     createdAt: new Date().toISOString(),
  //     creator: {
  //       name: "Current User",
  //       email: "current@example.com"
  //     },
  //     whitelistedEmails: [],
  //     accesses: []
  //   };

  //   setShareLinks([...shareLinks, newLink]);
  //   setIsCreatingLink(false);
  // };

  // const handleDeleteLink = (linkId: string) => {
  //   setShareLinks(links => links.filter(link => link.id !== linkId));
  // };

  // const handleAddWhitelistedEmail = (linkId: string) => {
  //   if (!newEmail || !newEmail.includes("@")) return;

  //   setShareLinks(links =>
  //     links.map(link =>
  //       link.id === linkId
  //         ? {
  //             ...link,
  //             whitelistedEmails: [...link.whitelistedEmails, newEmail]
  //           }
  //         : link
  //     )
  //   );
  //   setNewEmail("");
  // };

  // const handleRemoveWhitelistedEmail = (linkId: string, email: string) => {
  //   setShareLinks(links =>
  //     links.map(link =>
  //       link.id === linkId
  //         ? {
  //             ...link,
  //             whitelistedEmails: link.whitelistedEmails.filter(e => e !== email)
  //           }
  //         : link
  //     )
  //   );
  // };

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
        <h1 className="text-2xl font-bold mb-6">Video Details</h1>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sharing">Share Links</TabsTrigger>
            <TabsTrigger value="access">Access Log</TabsTrigger>
          </TabsList>
          
          {/* Video Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {video && (
              <div className="rounded-lg border p-4">
                <h2 className="text-xl font-semibold mb-4">Video Information</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Title</div>
                    <div className="col-span-2">{video.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Status</div>
                    <div className="col-span-2">
                      <Badge>
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">File Size</div>
                    <div className="col-span-2">
                      {formatFileSize(video.fileSize)}
                    </div>
                  </div>
                  {video.duration && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Duration</div>
                      <div className="col-span-2">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  )}
                  {video.mimeType && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">File Type</div>
                      <div className="col-span-2">{video.mimeType}</div>
                    </div>
                  )}
                  {video.dimensions && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Resolution</div>
                      <div className="col-span-2">
                        {video.dimensions.width} × {video.dimensions.height}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Upload Date</div>
                    <div className="col-span-2">
                      {format(new Date(video.createdAt), "PPP")}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Last Updated</div>
                    <div className="col-span-2">
                      {format(new Date(video.updatedAt), "PPP")}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Thumbnail</div>
                    <div className="col-span-2">
                      <div className="relative w-48 h-27 rounded-lg overflow-hidden">
                        <Image
                          src={video.thumbnailURL}
                          alt={`Thumbnail for ${video.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Video</div>
                    <div className="col-span-2">
                      <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
                        <video
                          className="absolute top-0 left-0 w-full h-full"
                          controls
                          playsInline
                          preload="metadata"
                          poster={video.thumbnailURL}
                        >
                          <source src={video.videoURL} type={video.mimeType || 'video/mp4'} />
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
        {/* Share Links Tab
          <TabsContent value="sharing" className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Share Links</h2>
                <Dialog open={isCreatingLink} onOpenChange={setIsCreatingLink}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Share Link</DialogTitle>
                    </DialogHeader>
                    <Select onValueChange={(value: "PUBLIC" | "PRIVATE") => handleCreateShareLink(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private (Whitelist Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {shareLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={link.visibility === "PUBLIC" ? "default" : "secondary"}>
                            {link.visibility}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created by {link.creator.name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {format(new Date(link.createdAt), "PP")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/share/${link.id}`);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLinkId(editingLinkId === link.id ? null : link.id)}
                        >
                          {editingLinkId === link.id ? "Done" : "Edit"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editingLinkId === link.id && link.visibility === "PRIVATE" && (
                      <div className="mt-4 space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Whitelisted Emails</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {link.whitelistedEmails.map(email => (
                              <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {email}
                                <button
                                  onClick={() => handleRemoveWhitelistedEmail(link.id, email)}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              type="email"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddWhitelistedEmail(link.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>  */}
          
          {/* Access Log Tab 
          <TabsContent value="access" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-4">Access History</h2>
              <div className="space-y-4">
                {shareLinks.flatMap(link => 
                  link.accesses.map(access => (
                    <div key={access.viewedAt} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {access.viewerEmail || "Anonymous User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Viewed on {format(new Date(access.viewedAt), "PPp")}
                        </p>
                      </div>
                      <Badge variant={link.visibility === "PUBLIC" ? "default" : "secondary"}>
                        Via {link.visibility.toLowerCase()} link
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}


function formatFileSize(bytes: string): string {
  const size = parseInt(bytes);
  if (size < 1024) return size + ' B';
  const kb = size / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + ' MB';
  const gb = mb / 1024;
  return gb.toFixed(1) + ' GB';
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}