"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Eye, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  downloadUrl: string;
  onDelete?: () => void;
}

export function VideoCard({ 
  id, 
  title, 
  thumbnailUrl, 
  downloadUrl,
  onDelete 
}: VideoCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/video/${id}`);
      toast.success('Video deleted successfully');
      onDelete?.();
      router.refresh();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      window.open(downloadUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to start download');
    }
  };

  const isReady = status === "READY";

  return (
    <Card className="w-full group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 aspect-video relative overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg truncate" title={title}>
          {title}
        </CardTitle>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/video/${id}`}>
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={!isReady}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Watch Video</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/details/${id}`}>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                disabled={!isReady}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download Video</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Video</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {title}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Video</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}