export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div
        className="h-11 w-11 animate-spin rounded-full border-[3px] border-ima-line border-t-ima-primary"
        role="status"
        aria-label="Chargement"
      />
      <p className="mt-5 text-sm font-medium uppercase tracking-[2px] text-ima-faint">
        IMA Studio
      </p>
    </div>
  )
}
