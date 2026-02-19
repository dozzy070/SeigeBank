import express from 'express';
import {sendLoginAlertEmail, sendRegisterEmail, sendResetEmail } from '../Utils/email.js';

const router = express.Router();
router.post('/send-login-alert', sendLoginAlertEmail);
router.post('/send-register', sendRegisterEmail);
router.post('/send-reset', sendResetEmail);

export default router;