"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
};

const FALLBACK_SRC = "/static/images/products/default.jpg";

export default function ProductImage({ src, alt, className }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC);

  return (
    <Image
      src={imgSrc || FALLBACK_SRC}
      alt={alt}
      width={400}
      height={260}
      className={className ?? "w-full h-[260px] object-cover block"}
      onError={() => setImgSrc(FALLBACK_SRC)}
    />
  );
}
