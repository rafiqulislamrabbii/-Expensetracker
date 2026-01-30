import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { TransactionSchema } from '@expense-tracer/shared';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get list with filters
router.get('/', async (req, res) => {
  const { from, to, type, limit = '20' } = req.query;
  const userId = req.user!.userId;

  const where: any = { userId };
  if (from && to) {
    where.date = { gte: new Date(from as string), lte: new Date(to as string) };
  }
  if (type) {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    take: parseInt(limit as string),
    orderBy: { date: 'desc' },
    include: { category: true }
  });

  res.json({ success: true, data: transactions });
});

router.post('/', async (req, res) => {
  try {
    const data = TransactionSchema.parse(req.body);
    const userId = req.user!.userId;

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        date: new Date(data.date),
        categoryId: data.categoryId,
        notes: data.notes,
        userId
      }
    });

    res.json({ success: true, data: transaction });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  await prisma.transaction.deleteMany({
    where: { id, userId } // Ensure ownership
  });

  res.json({ success: true });
});

export default router;
