import { PrismaClient } from '@prisma/client'

// Singleton Prisma : évite la multiplication des connexions en développement
// (hot-reload Next.js). Ne jamais instancier PrismaClient ailleurs (cf. CLAUDE.md).
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
