const Sequelize = require("sequelize");
const ChatRoom = require("./ChatRoom");
const User = require("./User");
const Product = require("./Product");
const Dialog = require("./Dialog");
const Wishlist = require("./Wishlist");
require("dotenv").config();

const db = {};

const sequelize = new Sequelize(
  {
    username: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "mysql",
    define:{
      raw: true,
    },
  }
);

db.sequelize = sequelize;


db.User = User;
db.ChatRoom = ChatRoom;
db.Product = Product;
db.Dialog = Dialog;
db.Wishlist = Wishlist;

// 각 모델의 static init을 호출, init이 실행되어야 테이블이 모델로 연결(테이블-모델 연결)
User.init(sequelize);
ChatRoom.init(sequelize);
Product.init(sequelize);
Dialog.init(sequelize);
Wishlist.init(sequelize);

// 다른 테이블과 관계를 연결
User.associate(db);
ChatRoom.associate(db);
Product.associate(db);
Dialog.associate(db);
Wishlist.associate(db);

module.exports = db;