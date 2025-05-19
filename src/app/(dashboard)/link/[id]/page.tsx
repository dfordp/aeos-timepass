"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface ShareLink {
  id: string;
  videoId: string;
  visibility: "PUBLIC" | "PRIVATE";
  expiresAt: string | null;
}

export default function LinkPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const {user} = useUser()
  const userMail = user?.primaryEmailAddress?.emailAddress

  useEffect(() => {
    const validateAndRecordAccess = async () => {
      try {
        // Step 1: Validate the share link
        const validateResponse = await axios.get(`/api/link/${params.id}`);
        
        if (!validateResponse.data.success) {
          throw new Error(validateResponse.data.error);
        }

        if (!validateResponse.data) {
          throw new Error(validateResponse.data.error);
        }

        const shareLink = validateResponse.data.data as ShareLink;
        

        // Step 2: Record the access
        const accessRecord = await axios.post('/api/access', {
          shareLinkId: shareLink.id,
          videoId: shareLink.videoId,
          viewerEmail: userMail
        });

        // Step 3: Redirect to video page
        if(accessRecord){
          router.push(`/video/${shareLink.videoId}`);
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          
          if (status === 404) {
            toast.error("This share link doesn't exist");
          } else if (status === 410) {
            toast.error("This share link has expired");
          } else {
            toast.error("Failed to access video");
          }
        }
        
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      validateAndRecordAccess();
    }
  }, [params.id, router, userMail]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Video...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
        </div>
      ) : null}
    </div>
  );
}