import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import ExpressError from '../utils/ExpressError.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { reviewSchema } from '../schemas.js';

const router = express.Router({ mergeParams: true});

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else{
      next();
    }
  };

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.send({success: true, 
      msg: '리뷰 추가에 성공했습니다.', 
      id: id });
  }));
  
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.send({success: true, 
      msg: '리뷰 삭제에 성공했습니다.', 
      id: id });
  }));

export default router;