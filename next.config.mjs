/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Empêche l'app d'être intégrée dans une iframe (anti-clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  // Empêche le sniffing de type MIME
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limite les informations de référent fuitées
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Désactive des API navigateur sensibles par défaut
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS pendant 2 ans (effectif uniquement servi en HTTPS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
