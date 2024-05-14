import express from 'express';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import session from 'express-session';
import flash from 'connect-flash';
import ExpressError from './utils/ExpressError.js';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from './models/user.js';

import userRoutes from './routes/users.js'; 
import campgroundRoutes from './routes/campgrounds.js';
import reviewRoutes from './routes/reviews.js';
import MongoStore from 'connect-mongo';

import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';


//const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

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

//MongoDB Injection 방지
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({  
  mongoUrl: dbUrl, //세션 저장소로 사용할 데이터베이스 주소
  secret, //세션 암호화에 사용할 키
  touchAfter: 24 * 3600  //세션을 업데이트하는 주기
});

store.on("error", function(e) {
  console.log("세션 저장소 오류", e);
});

const sessionConfig = {
  store,
  name: 'session',  //쿠키 이름
  secret, //세션 암호화에 사용할 키
  resave: false,  //세션에 변화가 없어도 다시 저장할지 여부
  saveUninitialized: true,  //세션에 저장된 내용이 없어도 저장할지 여부
  cookie: {
    httpOnly: true,  //자바스크립트로 쿠키에 접근하지 못하도록 함
    // secure: true,   //https에서만 쿠키를 전송하도록 함. (배포시 주석 해제)
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //쿠키 만료 시간
    maxAge: 1000 * 60 * 60 * 24 * 7 //쿠키 만료 시간
  }   
}
app.use(session(sessionConfig));
app.use(flash());  

//컨텐츠 보안 정책 설정
const scriptSrcUrls = [
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dibhzzbts/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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
  if(req.method == "DELETE" || req.method == "PUT"  
   || contentType == 'application/json') 
  {
    res.status(statusCode).send({success: false, msg: message});
  }
  else 
  {
    res.status(statusCode).render('error', { err });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 대기 중입니다.`);
});