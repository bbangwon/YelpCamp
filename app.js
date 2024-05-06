import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import ExpressError from './utils/ExpressError.js';
import campgrounds from './routes/campgrounds.js';
import reviews from './routes/reviews.js';

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

const publicFolder = fileURLToPath(new URL("./public", import.meta.url));
app.use(express.static(publicFolder));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
});

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