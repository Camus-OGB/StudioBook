import type { Metadata } from 'next'
import ReservationForm from '@/components/reservation/ReservationForm'

export const metadata: Metadata = {
  title: 'Réservation – IMA Studio',
}

export default function ReservationPage() {
  return <ReservationForm />
}
