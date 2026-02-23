import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const users = [
    {
      username: 'corp_sec',
      name: 'Corporate Secretary (Notulensi BOD)',
      role: 'SECRETARY',
      avatar_seed: 'secretary-official',
      division: 'Corporate Secretary',
      password: '123456',
    },
    {
      username: 'rosita_finance',
      name: 'Rosita Delaila M',
      role: 'UNIT',
      avatar_seed: 'finance-dep',
      division: 'GM Finance',
      password: '123456',
    },
    {
      username: 'herwandy_it',
      name: 'Herwandy W. Patongai',
      role: 'UNIT',
      avatar_seed: 'it-planning',
      division: 'GM IT & Corporate Planning',
      password: '123456',
    },
    {
      username: 'cornelia_op',
      name: 'Cornelia Savitri',
      role: 'UNIT',
      avatar_seed: 'operation',
      division: 'GM Business Operation',
      password: '123456',
    },
    {
      username: 'samuel_support',
      name: 'Samuel Silitonga',
      role: 'UNIT',
      avatar_seed: 'support-unit',
      division: 'GM Business Support',
      password: '123456',
    },
    {
      username: 'feri_sales',
      name: 'Feri Hadianto',
      role: 'UNIT',
      avatar_seed: 'sales-growth',
      division: 'GM Marketing & Sales',
      password: '123456',
    },
  ];

  for (const u of users) {
    const existing = await userRepo.findOne({
      where: { username: u.username },
    });
    if (existing) continue;

    const hashed = await bcrypt.hash(u.password, 10);

    await userRepo.save({
      ...u,
      password: hashed,
    });

    console.log(`Inserted ${u.username}`);
  }

  console.log('Seeding completed');
  process.exit();
}

seed();
