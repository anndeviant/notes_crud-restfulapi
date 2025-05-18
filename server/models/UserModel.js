import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const User = db.define(
  "user", // Nama Tabel
  {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    gender: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: Sequelize.TEXT,
  },
  {
    freezeTableName: true, // Menggunakan nama tabel sesuai dengan nama model
  }
);

db.sync().then(() => console.log("User model synchronized"));

export default User;
