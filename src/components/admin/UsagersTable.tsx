import type { User } from '@/types'

interface UsagersTableProps {
  users: User[]
  onRowClick: (user: User) => void
}

const TH = 'px-4 py-3.5 text-left text-[12px] font-semibold tracking-[.3px] text-ima-faint'
const TD = 'px-4 py-3.5'

export default function UsagersTable({ users, onRowClick }: UsagersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="bg-[#faf9fd]">
            <th className={TH}>IDENTIFIANT</th>
            <th className={TH}>NOM</th>
            <th className={TH}>EMAIL</th>
            <th className={TH}>LIEN</th>
            <th className={TH}>NIVEAU</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              onClick={() => onRowClick(u)}
              className="cursor-pointer border-t border-[#f1eff7] transition-colors hover:bg-ima-lilac/60"
            >
              <td className={`${TD} font-sora font-bold text-ima-primary`}>{u.id}</td>
              <td className={`${TD} font-semibold text-ima-ink`}>{u.prenom} {u.nom}</td>
              <td className={`${TD} text-ima-muted`}>{u.email}</td>
              <td className={`${TD} text-ima-muted`}>{u.lien}</td>
              <td className={`${TD} text-ima-muted`}>{u.niveauExperience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
