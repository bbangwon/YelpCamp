import User from '../models/user.js';

export default {
    renderRegister: (req, res) => {
        res.render('users/register');
    },
    register: async (req, res) => {
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
    },
    renderLogin: (req, res) => {
        res.render('users/login');
    },
    login: (req, res) => {
        req.flash('success', `Yelp Camp에 오신 것을 환영합니다! ${req.user.username}님!`);    
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        res.redirect(redirectUrl);
    } ,
    logout: (req, res, next) => {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', '로그아웃 되었습니다.');
            res.redirect('/campgrounds');
        });
    }   
}