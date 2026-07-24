import { PrismaClient, Role, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Users
  const adminHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@goopayrecon.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@goopayrecon.com',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const editorHash = await bcrypt.hash('Editor123!', 10);
  await prisma.user.upsert({
    where: { email: 'editor@goopayrecon.com' },
    update: {},
    create: {
      username: 'editor',
      email: 'editor@goopayrecon.com',
      passwordHash: editorHash,
      role: Role.EDITOR,
    },
  });

  const viewerHash = await bcrypt.hash('Viewer123!', 10);
  await prisma.user.upsert({
    where: { email: 'viewer@goopayrecon.com' },
    update: {},
    create: {
      username: 'viewer',
      email: 'viewer@goopayrecon.com',
      passwordHash: viewerHash,
      role: Role.VIEWER,
    },
  });
  console.log('Users seeded');

  // 2. Connectors
  const connectors = [
    { connectorCode: 'BIDV', connectorName: 'Ngân hàng BIDV' },
    { connectorCode: 'BVBANK', connectorName: 'Ngân hàng BVBank' },
    { connectorCode: 'NAPAS', connectorName: 'Napas' },
    { connectorCode: 'VIETCOMBANK', connectorName: 'Ngân hàng Vietcombank' },
  ];

  for (const c of connectors) {
    await prisma.connector.upsert({
      where: { connectorCode: c.connectorCode },
      update: {},
      create: c,
    });
  }
  console.log('Connectors seeded');

  // 3. Partners
  await prisma.partner.upsert({
    where: { partnerCode: 'PARENT-001' },
    update: {},
    create: { partnerCode: 'PARENT-001', partnerName: 'Tập đoàn ABC' },
  });

  await prisma.partner.upsert({
    where: { partnerCode: 'PARENT-002' },
    update: {},
    create: { partnerCode: 'PARENT-002', partnerName: 'Tập đoàn XYZ' },
  });

  const children = [
    { partnerCode: 'CHILD-001', partnerName: 'Công ty con 1 (ABC)', parentId: 'PARENT-001' },
    { partnerCode: 'CHILD-002', partnerName: 'Công ty con 2 (ABC)', parentId: 'PARENT-001' },
    { partnerCode: 'CHILD-003', partnerName: 'Công ty con 3 (XYZ)', parentId: 'PARENT-002' },
    { partnerCode: 'CHILD-004', partnerName: 'Công ty con 4 (XYZ)', parentId: 'PARENT-002' },
  ];

  for (const child of children) {
    await prisma.partner.upsert({
      where: { partnerCode: child.partnerCode },
      update: {},
      create: child,
    });
  }
  console.log('Partners seeded');

  // 4. Transactions (Delete all first to avoid huge dupes if re-seeded, or don't if using realistic unique constraints, but we don't have one, so we just create them)
  await prisma.transaction.deleteMany({});
  
  const transactions = [
    { date: new Date('2024-05-01'), partnerCode: 'CHILD-001', type: TransactionType.THU, quantity: 100, amount: 1500000, connectorCode: 'BIDV' },
    { date: new Date('2024-05-01'), partnerCode: 'CHILD-002', type: TransactionType.CHI, quantity: 50, amount: 500000, connectorCode: 'BVBANK' },
    { date: new Date('2024-05-02'), partnerCode: 'CHILD-003', type: TransactionType.QUYET_TOAN, quantity: 1, amount: 200000, connectorCode: 'NAPAS' },
    { date: new Date('2024-05-02'), partnerCode: 'CHILD-004', type: TransactionType.THU, quantity: 200, amount: 3000000, connectorCode: 'VIETCOMBANK' },
    { date: new Date('2024-05-03'), partnerCode: 'CHILD-001', type: TransactionType.CHI, quantity: 20, amount: 100000, connectorCode: 'BIDV' },
    { date: new Date('2024-05-03'), partnerCode: 'CHILD-002', type: TransactionType.THU, quantity: 150, amount: 2500000, connectorCode: 'NAPAS' },
    { date: new Date('2024-05-04'), partnerCode: 'CHILD-003', type: TransactionType.THU, quantity: 300, amount: 4500000, connectorCode: 'VIETCOMBANK' },
    { date: new Date('2024-05-04'), partnerCode: 'CHILD-004', type: TransactionType.QUYET_TOAN, quantity: 1, amount: 1500000, connectorCode: 'BVBANK' },
    { date: new Date('2024-05-05'), partnerCode: 'CHILD-001', type: TransactionType.THU, quantity: 80, amount: 1200000, connectorCode: 'BIDV' },
    { date: new Date('2024-05-05'), partnerCode: 'CHILD-002', type: TransactionType.CHI, quantity: 30, amount: 300000, connectorCode: 'NAPAS' },
    { date: new Date('2024-05-06'), partnerCode: 'CHILD-003', type: TransactionType.QUYET_TOAN, quantity: 1, amount: 4200000, connectorCode: 'VIETCOMBANK' },
    { date: new Date('2024-05-06'), partnerCode: 'CHILD-004', type: TransactionType.THU, quantity: 120, amount: 1800000, connectorCode: 'BVBANK' },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }
  
  console.log('Transactions seeded');
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
