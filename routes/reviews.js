import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import Reviews from '../controllers/reviews.js';
import { validateReview, isLoggedIn, isReviewAuthor } from '../middleware.js';

const router = express.Router({ mergeParams: true});

router.post('/', isLoggedIn, validateReview, catchAsync(Reviews.createReview));  
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(Reviews.deleteReview));

export default router;