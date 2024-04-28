import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import Campground from './models/campground.js';

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("데이터베이스에 연결했습니다.");
});

const app = express();

const viewsFolder = fileURLToPath(new URL("./views", import.meta.url));
app.set('views', viewsFolder);
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: '내 블랙야드', description: '저렴한 캠프장입니다.'});
    await camp.save();
    res.send(camp);
});

app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중입니다.');
});