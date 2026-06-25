import type { Metadata } from 'next'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const metadata: Metadata = {
  title: 'Administration – IMA Studio',
}

export default function AdminPage() {
  return <AdminDashboard />
}
