"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { UploadModal } from "./add-video-modal";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="py-4 px-2 w-screen">
      <div className="flex items-center justify-between">
        <div>
            <Link href="/" className="font-bold text-xl">
                AeosLabs
            </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsModalOpen(true)}
          >
            + Add Video
          </Button>
          <UserButton afterSignOutUrl="/"/>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-background border-b">
          <div className="container max-w-7xl mx-auto py-4 flex flex-col gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
            >
              + Add Video
            </Button>
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </nav>
  );
}