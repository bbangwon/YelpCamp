import { campgroundSchema } from "./schemas.js";
import { reviewSchema } from './schemas.js';

import ExpressError from "./utils/ExpressError.js";
import Campground from "./models/campground.js";
import Review from "./models/review.js";


export const storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;        
    }
    next();
}

export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        var contentType = req.header('content-type') || '';  
        if(req.method == "DELETE" || req.method == "PUT" 
            || contentType == 'application/json') 
        {
            return res.status(401).send(
                {
                    success: false, 
                    msg: '로그인이 필요합니다.',
                    redirectUrl: '/login'                    
                });
        }
        else 
        {
            req.flash('error', '로그인이 필요합니다.');
            return res.redirect('/login');
        }
    }
    next();
}
  
export const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
  
      var contentType = req.header('content-type') || '';  
      if(req.method == "DELETE" || req.method == "PUT" 
        || contentType == 'application/json') 
      {
          return res.status(403).send({
            success: false, 
            msg: '권한이 없습니다.',
            redirectUrl: `/campgrounds/${id}`
          });
      }
      else 
      {
        req.flash('error', '권한이 없습니다.');
        return res.redirect(`/campgrounds/${id}`);
      }
    }
    next();
  }

  export const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
  
      var contentType = req.header('content-type') || '';  
      if(req.method == "DELETE" || req.method == "PUT" 
       || contentType == 'application/json') 
      {
          return res.status(403).send({
            success: false, 
            msg: '권한이 없습니다.',
            redirectUrl: `/campgrounds/${id}`
          });
      }
      else 
      {
        req.flash('error', '권한이 없습니다.');
        return res.redirect(`/campgrounds/${id}`);
      }
    }
    next();
  }

  export const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

export const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else{
      next();
    }
  };

