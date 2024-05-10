import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import passport from 'passport';
import { storeReturnTo } from '../middleware.js';
import users from '../controllers/users.js';

const router = express.Router();

//등록
router.get('/register', users.renderRegister);
router.post('/register', catchAsync(users.register));

//로그인
router.get('/login', users.renderLogin);
router.post('/login',
    storeReturnTo,
    passport.authenticate('local', {
        failureFlash: '로그인에 실패했습니다. 다시 시도하세요.',
        failureRedirect: '/login',
    }),
    users.login);

//로그아웃
router.get('/logout', users.logout);


export default router;