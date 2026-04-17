"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { XIcon } from "lucide-react";

interface ProductImageViewerProps {
  imageUrl: string | null;
  description: string;
}

export function ProductImageViewer({ imageUrl, description }: ProductImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow w-fit"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="pt-6 flex justify-center">
          <img
            src={imageUrl}
            alt={description}
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
            <img
              src={imageUrl}
              alt={description}
              className="max-w-4xl max-h-[90vh] object-contain rounded-lg"
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
