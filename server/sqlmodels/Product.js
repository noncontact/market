const Sequelize = require("sequelize");
//const User = require("./user");

module.exports = class User extends Sequelize.Model {
  // User 모델을 만들고 모듈로 exports함(User 모델은 Sequelize.Model을 확장한 클래스)
  static init(sequelize) {
    // 테이블에 대한 설정 <-> static associate: 다른 모델과의 관계
    return super.init(
      {
        // super.init의 첫 번째 인수: 테이블에 대한 컬럼 설정
        id: {
          type: Sequelize.INTEGER, // INTEGER : MySQL의 INT
          autoIncrement: true, // autoIncrement : MYSQL의 AUTO_INCREMENT
          primaryKey: true, // primaryKey: MySQL의 PRIMARY KEY
        },
        title: {
          type: Sequelize.STRING(50), // STRING : MySQL의 VARCHAR
        },
        category: {
          type: Sequelize.STRING(255), // STRING : MySQL의 VARCHAR
          unique: true,
        },
        description: {
          type: Sequelize.STRING(255),
        },
        price: {
          type: Sequelize.INTEGER,
        },
        city: {
          type: Sequelize.STRING(255), // INTEGER : MySQL의 INT
        },
        image: {
          type: Sequelize.STRING(255), // INTEGER : MySQL의 FLOAT
        },
        addedAt: {
            type: "TIMESTAMP", //  MySQL의 DATETIME
            defaultValue: Sequelize.NOW, // insert시 현재 시간 기본값으로
        },
        seller:{
            type:Sequelize.INTEGER,
        },
        active:{
          type:Sequelize.BOOLEAN,
          defaultValue:true,
        },
        
      },
      {
        // super.init의 두 번째 인수: 테이블 자체에 대한 설정(테이블 옵션)
        sequelize, // static init 메서드의 매개변수와 연결되는 옵션, db.sequelize 객체를 넣어야 함 -> 추후에 models/index.js에서 연결
        timestamps: false, // true: Sequelize가 자동으로 createdAt과 updatedAt 컬럼을 추가
        underscored: false, // true: create_at같이(스네이크 케이스), false: createdAt같이(캐멀 케이스)
        modelName: "Product", // 모델 이름
        tableName: "product", // 테이블 이름
        paranoid: false, // 컬럼을 지워도 완전히 지워지지 않고 deletedAt이라는 컬럼이 생김(지운 시각이 기록됨)
        charset: "utf8", // 한글 입력, 이모티콘까지 입력: utf8mb4
        collate: "utf8_general_ci", // 한글 입력, 이모티콘까지 입력: utf8mb4_general_ci
      }
    );
  }
  //관계 설정 JOIN
  static associate(db) {
    db.Product.belongsTo(db.User, { foreignKey: "seller", targetKey: "id" }); // Product : user = n : 1
    db.Product.hasMany(db.Wishlist, {
      foreignKey: "product_id",
      sourceKey: "id",
    }); // user : Product = 1 : n
  }
};