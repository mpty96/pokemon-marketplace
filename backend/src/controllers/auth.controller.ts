import { Request, Response } from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
} from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const user = await registerUser(email, username, password);
    res.status(201).json({
      message: 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
      user,
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_IN_USE') {
      res.status(409).json({ error: 'El email ya está registrado' });
    } else if (error.message === 'USERNAME_IN_USE') {
      res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export async function verify(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token requerido' });
      return;
    }

    const result = await verifyEmail(token);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'TOKEN_INVALID') {
      res.status(400).json({ error: 'Token inválido' });
    } else if (error.message === 'ALREADY_VERIFIED') {
      res.status(400).json({ error: 'Email ya verificado' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    } else if (error.message === 'EMAIL_NOT_VERIFIED') {
      res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesión' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token requerido' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await getMe(userId);
    res.json(user);
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
}