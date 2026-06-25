'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StudioImageProps {
  src: string
  alt: string
  /** Emoji affiché sur le dégradé tant que l'image réelle n'est pas fournie. */
  label?: string
  className?: string
}

/**
 * Affiche une photo si le fichier existe dans /public/images, sinon un visuel
 * dégradé de marque (repli automatique via onError). Permet de déposer les vraies
 * photos plus tard sans toucher au code.
 */
export default function StudioImage({ src, alt, label = '🎬', className }: StudioImageProps) {
  const [errored, setErrored] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-[#4527A0] to-[#7E57C2]',
        className,
      )}
    >
      {!errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          role="img"
          aria-label={alt}
        >
          <span className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-ima-accent/20" />
          <span className="text-5xl opacity-90">{label}</span>
        </div>
      )}
    </div>
  )
}
