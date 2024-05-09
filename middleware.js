export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        var contentType = req.header('content-type') || '';  
        if(contentType == 'application/json') 
        {
            return res.status(401).send({success: false, msg: '로그인이 필요합니다.'});
        }
        else 
        {
            req.flash('error', '로그인이 필요합니다.');
            return res.redirect('/login');
        }
    }
    next();
}

export const storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;        
    }
    next();
}

