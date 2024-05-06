import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import catchAsync from './utils/catchAsync.js';
import ExpressError from './utils/ExpressError.js';
import Campground from './models/campground.js';
import Review from './models/review.js';
import { reviewSchema } from './schemas.js';
import campgrounds from './routes/campgrounds.js';

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("데이터베이스에 연결했습니다.");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('ejs', ejsMate);

const viewsFolder = fileURLToPath(new URL("./views", import.meta.url));
app.set('views', viewsFolder);
app.set('view engine', 'ejs');

app.use(express.static('public'));

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else{
    next();
  }
};

app.use('/campgrounds', campgrounds);

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
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

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.send({success: true, 
    msg: '리뷰 삭제에 성공했습니다.', 
    id: id });
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('페이지를 찾을 수 없어요.', 404));
});

//에러처리
app.use((err, req, res, next) => {
  const {statusCode = 500, message = '에러가 발생했습니다.'} = err;  

  var contentType = req.header('content-type') || '';  
  if(contentType == 'application/json') 
  {
    res.status(statusCode).send({success: false, msg: message});
  }
  else 
  {
    res.status(statusCode).render('error', { err });
  }
});

app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중입니다.');
});