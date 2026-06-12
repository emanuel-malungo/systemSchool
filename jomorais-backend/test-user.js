import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.tb_utilizadores.findMany({
    include: { tb_tipos_utilizador: true }
  })
  
  const emanuel = users.find(u => u.nome.includes("Emanuel") || u.user.includes("emanuel"))
  console.log("Emanuel Malungo User:", emanuel)
  
  const tipos = await prisma.tb_tipos_utilizador.findMany()
  console.log("Tipos:", tipos)
}

main().catch(console.error).finally(() => prisma.$disconnect())
