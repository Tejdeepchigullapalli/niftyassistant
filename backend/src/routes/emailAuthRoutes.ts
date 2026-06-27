import { Router } from 'express';
import { register, login, logout, getMe, checkEmail, linkGoogle, forgotPassword, resetPassword, verifyEmail } from '../controllers/emailAuthController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/check-email', checkEmail);
router.post('/link-google', linkGoogle);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

export default router;
