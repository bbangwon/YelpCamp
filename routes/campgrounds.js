import express from 'express';
import campgrounds from '../controllers/campgrounds.js';
import catchAsync from '../utils/catchAsync.js';
import { isLoggedIn, validateCampground, isAuthor } from '../middleware.js';
import multer from 'multer';
import { storage } from '../cloudinary/index.js';

const upload = multer({ storage });

const router = express.Router();

router.route('/')
    .get(catchAsync(campgrounds.index))         //캠핑장 목록
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));    //캠핑장 추가

    //추가
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))        //캠핑장 세부정보
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))    //캠핑장 수정
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));    //캠핑장 삭제

//수정
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

export default router;