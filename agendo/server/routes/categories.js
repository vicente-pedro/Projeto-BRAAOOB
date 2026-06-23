import { Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    res.json(await store.listCategories(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { label } = req.body;
  if (!label?.trim()) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }
  try {
    const category = await store.createCategory(req.userId, label.trim());
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
