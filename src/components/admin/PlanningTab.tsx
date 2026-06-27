'use client'

import { useEffect, useState } from 'react'
import PlanningCalendar from '@/components/admin/PlanningCalendar'

export default function PlanningTab() {
  const [espaces, setEspaces] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEspaces(d.data.espace ?? [])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mt-5">
      <PlanningCalendar espaces={espaces} />
    </div>
  )
}
