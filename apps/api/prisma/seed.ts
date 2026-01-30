import { PrismaClient } from '@prisma/client';
import { exit } from 'process';

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { nameEn: 'Salary', nameBn: 'বেতন', type: 'INCOME' },
    { nameEn: 'Business', nameBn: 'ব্যবসা', type: 'INCOME' },
    { nameEn: 'Gift', nameBn: 'উপহার', type: 'INCOME' },
    { nameEn: 'Food', nameBn: 'খাবার', type: 'EXPENSE' },
    { nameEn: 'Transport', nameBn: 'যাতায়াত', type: 'EXPENSE' },
    { nameEn: 'Rent', nameBn: 'ভাড়া', type: 'EXPENSE' },
    { nameEn: 'Bills', nameBn: 'বিল (বিদ্যুৎ/গ্যাস)', type: 'EXPENSE' },
    { nameEn: 'Health', nameBn: 'চিকিৎসা', type: 'EXPENSE' },
    { nameEn: 'Education', nameBn: 'শিক্ষা', type: 'EXPENSE' },
    { nameEn: 'Shopping', nameBn: 'কেনাকাটা', type: 'EXPENSE' },
    { nameEn: 'Entertainment', nameBn: 'বিনোদন', type: 'EXPENSE' },
  ];

  console.log('Seeding default categories...');

  for (const cat of defaultCategories) {
    // Upsert to avoid duplicates
    const exists = await prisma.category.findFirst({
        where: { nameEn: cat.nameEn, isDefault: true }
    });
    
    if (!exists) {
        await prisma.category.create({
          data: {
            ...cat,
            type: cat.type as 'INCOME' | 'EXPENSE',
            isDefault: true,
          },
        });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });