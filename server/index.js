const express = require('express');
const app = express();
const { PORT } = require('./config/config');
const http = require('http').createServer(app);
const auth = require('./middlewares/auth')
const routes = require('./routes');
require("dotenv").config();
require('./config/express')(app);
//require('./config/mongoose');
const { sequelize } = require("./sqlmodels");


sequelize
  .sync({ force: true }) // 서버 실행 시 MySQL과 연동되도록 함, force: true면 서버 실행 시 마다 테이블을 재생성, 테이블을 잘못 만든 경우에 true로 설정
  .then(() => {
    console.log("DB connection Success!!");
  })
  .catch((err) => {
    console.error(err);
  });
app.use(auth())


app.use(routes);
http.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}...`));
