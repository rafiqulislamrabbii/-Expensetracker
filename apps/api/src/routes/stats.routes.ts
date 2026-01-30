import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  const userId = req.user!.userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Totals for current month
  const aggregations = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth }
    },
    _sum: {
      amount: true
    }
  });

  let income = 0;
  let expense = 0;

  aggregations.forEach(agg => {
    if (agg.type === 'INCOME') income = Number(agg._sum.amount) || 0;
    if (agg.type === 'EXPENSE') expense = Number(agg._sum.amount) || 0;
  });

  // Category breakdown for pie chart
  const categoryStats = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
    _sum: { amount: true }
  });

  // Fetch category names
  const categoryIds = categoryStats.map(c => c.categoryId);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  
  const pieData = categoryStats.map(stat => {
    const cat = categories.find(c => c.id === stat.categoryId);
    return {
      nameBn: cat?.nameBn || 'অজানা',
      nameEn: cat?.nameEn || 'Unknown',
      value: Number(stat._sum.amount)
    };
  });

  res.json({
    success: true,
    data: {
      summary: { income, expense, net: income - expense },
      pieData
    }
  });
});

export default router;
