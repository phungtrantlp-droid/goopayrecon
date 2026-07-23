import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive user' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});

router.put('/change-password', authenticate, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect old password' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

export default router;
