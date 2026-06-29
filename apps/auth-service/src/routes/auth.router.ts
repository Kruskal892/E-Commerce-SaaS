import express, { Router } from 'express';
import { userRegistration, verifyUser } from '../controllers';

const router: Router = express.Router();

router.post('/user-register', userRegistration);
router.post('/verify-user', verifyUser);
export default router;
