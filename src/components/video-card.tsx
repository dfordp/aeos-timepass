"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Eye, Info } from "lucide-react";
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

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export function VideoCard({ id, title, thumbnailUrl, downloadUrl }: VideoCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="p-0 aspect-video relative overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg truncate">{title}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/video/${id}`}>
                <Button
                  variant="secondary"
                  size="icon"
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
                onClick={() => window.open(downloadUrl, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download Video</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}