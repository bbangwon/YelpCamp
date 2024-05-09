import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import Campground from '../models/campground.js';
import { isLoggedIn, validateCampground, isAuthor } from '../middleware.js';

const router = express.Router();

//목록
router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

//추가
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body);
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', '캠핑장을 추가했습니다.');
  res.send({
    success: true,
    msg: '캠핑장을 추가했습니다.',
    id: campground._id
  });
}));

//세부정보
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: { 
      path: 'author'
    }
  }).populate('author');
  if(!campground){
    req.flash('error', '캠핑장을 찾을 수 없습니다.');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}));

//수정
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const campground = await Campground.findById(id);  
  if(!campground){
    req.flash('error', '캠핑장을 찾을 수 없습니다.');
    return res.redirect('/campgrounds');
  }

  res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, req.body);
  req.flash('success', '캠핑장을 수정했습니다.');
  res.send({
    success: true,
    msg: '캠핑장을 수정했습니다.',
    id: id
  });
}));

//삭제
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', '캠핑장을 삭제했습니다.');
  res.send({
    success: true,
    msg: '캠핑장을 삭제했습니다.',
    id: id
  });
}));

export default router;