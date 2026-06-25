import express, { Router } from 'express';
import { userRegistration } from '../controllers';

const router: Router = express.Router();

router.post('/user-register', userRegistration);
export default router;
