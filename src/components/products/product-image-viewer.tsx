"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { XIcon } from "lucide-react";

interface ProductImageViewerProps {
  imageUrl: string | null;
  description: string | null;
}

export function ProductImageViewer({ imageUrl, description }: ProductImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) return null;

  const alt = description || "Product photo";

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow w-fit"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="pt-6 flex justify-center">
          <Image
            src={imageUrl}
            alt={alt}
            width={192}
            height={256}
            className="w-48 h-64 object-cover rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Full View Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={896}
              height={1194}
              className="max-w-4xl max-h-[90vh] w-auto h-auto object-contain rounded-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
              aria-label="Close image"
            >
              <XIcon size={24} className="text-black" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
