"use client";

import Image from "next/image";
import { useState } from "react";

type AgentProfileImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
};

export default function AgentProfileImage({ src, alt, className, fallbackSrc = "/placeholder-user.jpg" }: AgentProfileImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={className}
        onError={() => console.error(`Failed to load fallback image: ${fallbackSrc}`)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => {
        console.log(`Image load failed: ${src}`);
        setError(true);
      }}
      priority={false}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}