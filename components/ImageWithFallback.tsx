"use client"

import Image from "next/image"
import { useState } from "react"

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  fill,
  className,
  sizes
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  const commonProps = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    sizes
  }

  if (fill) {
    return <Image {...commonProps} fill />
  }

  return (
    <Image
      {...commonProps}
      width={width || 200}
      height={height || 200}
    />
  )
}