import { cn } from '@/lib/utils'

// Bloc de chargement réutilisable (effet « pulse »).
// Sert à matérialiser visuellement l'attente plutôt qu'un texte « Chargement… »,
// conformément au principe : aucun écran figé, toujours un retour visuel.
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-ima-line/70', className)} />
}

// Squelette prêt à l'emploi pour une fiche de détail (modale usager/réservation).
export function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
