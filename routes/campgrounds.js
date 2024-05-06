import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import ExpressError from '../utils/ExpressError.js';
import Campground from '../models/campground.js';
import { campgroundSchema } from '../schemas.js';

const router = express.Router();

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};


//목록
router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

//추가
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.post('/', validateCampground, catchAsync(async (req, res, next) => {

  const campground = new Campground(req.body);
  await campground.save();
  req.flash('success', '캠핑장 추가에 성공했습니다.');
  res.send({
    success: true,
    msg: '캠핑장 추가에 성공했습니다.',
    id: campground._id
  });
}));

//세부정보
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render('campgrounds/show', { campground });
}));

//수정
router.get('/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, req.body);
  res.send({
    success: true,
    msg: '캠핑장 수정에 성공했습니다.',
    id: id
  });
}));

//삭제
router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.send({
    success: true,
    msg: '캠핑장 삭제에 성공했습니다.',
    id: id
  });
}));

export default router;