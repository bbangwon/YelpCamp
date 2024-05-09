import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.js';
import passport from 'passport';
import { storeReturnTo } from '../middleware.js';

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, err => {
            if (err) return next(err);

            req.flash('success', `Yelp Camp에 오신 것을 환영합니다! ${registeredUser.username}님!`);
            res.redirect('/campgrounds');
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: '로그인에 실패했습니다. 다시 시도하세요.',
    failureRedirect: '/login',
}), (req, res) => {
    req.flash('success', `Yelp Camp에 오신 것을 환영합니다! ${req.user.username}님!`);    
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    console.log('redirectUrl: ' + redirectUrl);
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', '로그아웃 되었습니다.');
        res.redirect('/campgrounds');
    });
}); 


export default router;