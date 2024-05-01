import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import catchAsync from './utils/catchAsync.js';
import ExpressError from './utils/ExpressError.js';
import Campground from './models/campground.js';

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

app.get('/', (req, res) => {
    res.render('home');
});

//목록
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

//추가
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body);    
    await campground.save();
    res.send({success: true, 
      msg: '캠핑장 추가에 성공했습니다.', 
      id: campground._id });
}));

//세부정보
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}));

//수정
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, req.body);
  res.send({success: true, 
    msg: '캠핑장 수정에 성공했습니다.', 
    id: id });
}));

//삭제
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.send({success: true, 
    msg: '캠핑장 삭제에 성공했습니다.', 
    id: id });
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('페이지를 찾을 수 없어요.', 404));
});

//에러처리
app.use((err, req, res, next) => {
  console.log(err.stack);
  const {statusCode = 500, message = '에러가 발생했습니다.'} = err;  

  var contentType = req.header('content-type') || '';  
  console.log(contentType);
  if(contentType == 'application/json') 
  {
    res.status(statusCode).send({success: false, msg: message});    
  }
  else 
  {
    res.status(statusCode).send(message);
  }
});

app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중입니다.');
});