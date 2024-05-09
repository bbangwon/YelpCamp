import express from 'express';
import campgrounds from '../controllers/campgrounds.js';
import catchAsync from '../utils/catchAsync.js';
import { isLoggedIn, validateCampground, isAuthor } from '../middleware.js';

const router = express.Router();

//목록
router.get('/', campgrounds.index);

//추가
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//세부정보
router.get('/:id', catchAsync(campgrounds.showCampground));

//수정
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//삭제
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

export default router;