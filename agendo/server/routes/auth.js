import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../store.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

  try {
    if (await store.getUserByEmail(email))
      return res.status(409).json({ error: 'E-mail já cadastrado' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await store.createUser({ name: name.trim(), email: email.trim(), passwordHash });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password)
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

  try {
    const user = await store.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Não autenticado' });

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await store.getUserById(payload.userId);
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
