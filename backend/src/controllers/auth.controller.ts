import { Request, Response } from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
  requestPasswordReset,
  performPasswordReset,
} from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, username, password, acceptedTerms } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    if (!acceptedTerms) {
      res.status(400).json({ error: 'Debes aceptar los términos y condiciones' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const user = await registerUser(email, username, password, acceptedTerms);

    res.status(201).json({
      message: 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
      user,
    });
  } catch (error: any) {
    if (error.message === 'TERMS_NOT_ACCEPTED') {
      res.status(400).json({ error: 'Debes aceptar los términos y condiciones' });
      return;
    }

    if (error.message === 'EMAIL_IN_USE') {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }

    if (error.message === 'USERNAME_IN_USE') {
      res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
      return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
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
    } else if (error.message === 'USER_BANNED') {
      res.status(403).json({ error: 'Tu cuenta está suspendida. Contacta al soporte de PokeMarket.' });
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
    const user = await getMe(payload.userId);

    if (user.profile?.isBanned) {
      res.status(403).json({ error: 'Cuenta suspendida' });
      return;
    }
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


export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email requerido' });
      return;
    }

    await requestPasswordReset(email);

    res.json({
      message:
        'Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer tu contraseña.',
    });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token y contraseña requeridos' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }

    await performPasswordReset(token, password);

    res.json({
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error: any) {
    if (error.message === 'TOKEN_INVALID') {
      res.status(400).json({ error: 'Token inválido o expirado' });
      return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
}