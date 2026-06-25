import { cn } from '@/lib/utils'

type BadgeVariant = 'pending' | 'confirmed' | 'refused' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const VARIANTS: Record<BadgeVariant, string> = {
  pending: 'bg-[#FFF4D6] text-[#9A6B00]',
  confirmed: 'bg-[#E8F7EF] text-[#157347]',
  refused: 'bg-[#FBE4E4] text-[#C0392B]',
  default: 'bg-ima-lilac text-ima-primary',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold',
        VARIANTS[variant],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
