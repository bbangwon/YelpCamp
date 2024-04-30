import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
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

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
  try
  {
    const campground = new Campground(req.body);
    await campground.save();
    res.send({success: true, 
      msg: '캠핑장 추가에 성공했습니다.', 
      id: campground._id });
  }
  catch(e) {
    res.send({success: false, 
      msg: `캠핑장 추가에 실패했습니다. (${e.message})`});    
  }
});

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
  try
  {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body);
    res.send({success: true, 
      msg: '캠핑장 수정에 성공했습니다.', 
      id: id });
  }
  catch(e) {
    res.send({success: false, 
      msg: `캠핑장 수정에 실패했습니다. (${e.message})`});    
  }
});

app.delete('/campgrounds/:id', async (req, res) => {
  try
  {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.send({success: true, 
      msg: '캠핑장 삭제에 성공했습니다.', 
      id: id });
  }
  catch(e) {
    res.send({success: false, 
      msg: `캠핑장 삭제에 실패했습니다. (${e.message})`});    
  }
});


app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중입니다.');
});