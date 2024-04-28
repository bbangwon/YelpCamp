import express from 'express';
import { fileURLToPath } from "url";

const app = express();

const viewsFolder = fileURLToPath(new URL("./views", import.meta.url));
app.set('views', viewsFolder);


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중입니다.');
});