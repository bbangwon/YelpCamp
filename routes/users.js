import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.flash('success', `Yelp Camp에 오신 것을 환영합니다! ${registeredUser.username}`);
        res.send({
            success: true,
            msg: '사용자 등록에 성공했습니다.',
            id: registeredUser._id
        });
    } catch(e){
        req.flash('error', e.message);
        throw new Error(e.message);
    }    
}));

export default router;