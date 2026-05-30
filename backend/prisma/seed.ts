import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Limpiar la base de datos (el orden importa por las llaves foráneas)
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  console.log('Base de datos limpiada. Insertando usuarios...');

  // Crear 3 usuarios de prueba con saldos iniciales y UUIDs fijos
  const user1 = await prisma.user.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000001',
      nombre: 'Alice Smith',
      email: 'alice@example.com',
      saldo: 200000.00,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'b0000000-0000-0000-0000-000000000002',
      nombre: 'Bob Johnson',
      email: 'bob@example.com',
      saldo: 50000.00,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'c0000000-0000-0000-0000-000000000003',
      nombre: 'Charlie Brown',
      email: 'charlie@example.com',
      saldo: 0.00,
    },
  });

  console.log('Usuarios de prueba creados exitosamente:');
  console.log(`- ${user1.nombre} | Email: ${user1.email} | Saldo: $${user1.saldo}`);
  console.log(`- ${user2.nombre} | Email: ${user2.email} | Saldo: $${user2.saldo}`);
  console.log(`- ${user3.nombre} | Email: ${user3.email} | Saldo: $${user3.saldo}`);
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
