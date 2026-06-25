import type { Metadata } from 'next'
import InscriptionForm from '@/components/inscription/InscriptionForm'

export const metadata: Metadata = {
  title: 'Inscription – IMA Studio',
}

export default function InscriptionPage() {
  return <InscriptionForm />
}
