import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { validateReview } from '../middleware.js';

const router = express.Router({ mergeParams: true});


router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', '리뷰를 추가했습니다.');
    res.send({success: true, 
      msg: '리뷰를 추가했습니다.', 
      id: id });
  }));
  
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', '리뷰를 삭제했습니다.');
    res.send({success: true, 
      msg: '리뷰를 삭제했습니다.', 
      id: id });
  }));

export default router;