"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr] md:gap-4">
      <div className="relative order-1 aspect-square overflow-hidden rounded-card bg-gray-100 md:order-2">
        <Image src={images[i]!} alt={`${name}, image ${i + 1} of ${images.length}`} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
      </div>
      <ul className="scrollbar-none order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col" aria-label="Product images">
        {images.map((src, n) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-label={`Show image ${n + 1}`}
              aria-current={n === i}
              className={cn("relative block size-16 overflow-hidden rounded-lg border-2 bg-gray-100 md:size-[72px]", n === i ? "border-navy-900" : "border-transparent hover:border-gray-300")}
            >
              <Image src={src} alt="" fill sizes="72px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
