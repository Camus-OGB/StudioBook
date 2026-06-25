import type { Stats } from '@/types'

interface StatsCardsProps {
  stats: Stats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cartes: { label: string; valeur: number; color: string }[] = [
    { label: 'Réservations', valeur: stats.totalReservations, color: 'text-ima-ink' },
    { label: 'En attente', valeur: stats.enAttente, color: 'text-[#9A6B00]' },
    { label: 'Confirmées', valeur: stats.confirmees, color: 'text-[#157347]' },
    { label: 'Refusées', valeur: stats.refusees, color: 'text-[#C0392B]' },
  ]

  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      <div className="rounded-2xl bg-ima-primary p-[18px] text-white shadow-[0_10px_26px_rgba(69,39,160,0.22)]">
        <div className="text-[12.5px] font-medium opacity-80">Usagers inscrits</div>
        <div className="mt-1 font-sora text-[30px] font-extrabold">{stats.totalUsers}</div>
      </div>
      {cartes.map((c) => (
        <div key={c.label} className="rounded-2xl border border-ima-line bg-white p-[18px]">
          <div className="text-[12.5px] font-medium text-ima-faint">{c.label}</div>
          <div className={`mt-1 font-sora text-[30px] font-extrabold ${c.color}`}>{c.valeur}</div>
        </div>
      ))}
    </div>
  )
}
