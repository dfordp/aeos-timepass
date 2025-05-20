"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Mail, Plus, Trash2, X} from "lucide-react";
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
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { ShareLinkDialog } from "@/components/share-video-modal";



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

interface ShareLinkData {
  id: string;
  videoId: string;
  creatorId: string;
  visibility: "PUBLIC" | "PRIVATE";
  expiresAt: string | null;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userWhitelist: Array<{
    id: string;
    email: string;
    name: string;
  }>;
  accesses: Array<{
    id: string;
    viewerEmail: string | null;
    viewedAt: string;
  }>;
}

interface Access {
  id: string;
  shareLinkId: string;
  viewerEmail: string | null;
  videoId: string;
  viewedAt: string;
}

type ExpiryPreset = '1h' | '12h' | '1d' | '30d' | 'forever';


export default function VideoDetails() {
  const router = useRouter();
  const params = useParams<{ id: string;}>()
  const videoId = params.id;

  const [video, setVideo] = useState<VideoData | null>(null);
  const [shareLinks, setShareLinks] = useState<ShareLinkData[] >([]);
  const [access, setAccess] = useState<Access[] >([]);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    visibility: "" as "PUBLIC" | "PRIVATE",
    expiryPreset: "" as ExpiryPreset,
    userEmails: [] as string[],
  });
  const {user} = useUser()

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

    const fetchShareLinks = async () => {
      try {
        const { data } = await axios.get(`/api/link?videoId=${videoId}`);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch Share Links:');
        }

        setShareLinks(data.links);
      } catch (error) {
        console.error('Error fetching Share Links:', error);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    const fetchAccess = async () => {
      try {
        const { data } = await axios.get(`/api/access?videoId=${videoId}`);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch video');
        }

        setAccess(data.links);
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
      fetchShareLinks();
      fetchAccess()
    }
  }, [params.id, videoId]);


  const handleCreateShareLink = async () => {
    try {
      // Convert preset to actual date
      let expiresAt: Date | null = null;
      
      if (formData.expiryPreset !== 'forever') {
        const now = new Date();
        switch (formData.expiryPreset) {
          case '1h':
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
            break;
          case '12h':
            expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
            break;
          case '1d':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }
  
      const response = await axios.post('/api/link', {
        videoId: video?.id,
        creatorId: user?.id,
        visibility: formData.visibility,
        expiresAt,
        userWhitelist: formData.userEmails
      });
  
      if (response.data.success) {
        setShareLinks(prev => [...prev, response.data.data]);
        toast.success('Share link created successfully');
        setIsCreatingLink(false);
        setFormData({ 
          visibility: "" as "PUBLIC" | "PRIVATE", 
          expiryPreset: "" as ExpiryPreset, 
          userEmails: [] 
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

   const handleDeleteLink = async (linkId: string) => {
      try {
          const response = await axios.delete(`/api/link/${linkId}`);
          
          if (response.data.success) {
              setShareLinks(links => links.filter(link => link.id !== linkId));
              toast.success('Share link deleted successfully');
          } else {
              throw new Error(response.data.error);
          }
      } catch (error) {
          console.error('Error deleting share link:', error);
          toast.error('Failed to delete share link');
      }
  };

  const handleAddWhitelistedEmail = (linkId: string) => {
    if (!newEmail || !newEmail.includes("@")) return;

    setShareLinks(links =>
      links.map(link =>
        link.id === linkId
          ? {
              ...link,
              whitelistedEmails: [...link.userWhitelist, newEmail]
            }
          : link
      )
    );
    setNewEmail("");
  };

  const handleRemoveWhitelistedEmail = (linkId: string, email: string) => {
    setShareLinks(links =>
      links.map(link =>
        link.id === linkId
          ? {
              ...link,
              whitelistedEmails: link.userWhitelist.filter(e => e.email !== email)
            }
          : link
      )
    );
  };

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
          
          <TabsContent value="sharing" className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Share Links</h2>
                <ShareLinkDialog
                  isOpen={isCreatingLink}
                  onOpenChange={setIsCreatingLink}
                  onCreateLink={handleCreateShareLink}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
              
              <div className="space-y-4">
                {!shareLinks || shareLinks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No share links created yet.</p>
                      <p className="text-sm">Click Create Link to share this video.</p>
                    </div>
                  ) : (
                shareLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={link.visibility === "PUBLIC" ? "default" : "secondary"}>
                            {link.visibility}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created by {user?.fullName}
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
                            navigator.clipboard.writeText(`${window.location.origin}/link/${link.id}`);
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
                            {link.userWhitelist.map(e => (
                              <Badge key={e.email} variant="secondary" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {e.email}
                                <button
                                  onClick={() => handleRemoveWhitelistedEmail(link.id, e.email)}
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
                )))}
              </div>
            </div>
          </TabsContent> 
          
          <TabsContent value="access" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-4">Access History</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading access history...
                  </div>
                ) : !access || access.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No access history found</p>
                    <p className="text-sm">Access logs will appear here when someone views your video</p>
                  </div>
                ) : (
                  access.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {record.viewerEmail || "Anonymous User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Viewed on {format(new Date(record.viewedAt), "PPp")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
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