import { Sequelize } from "sequelize";

const db = new Sequelize("notes_db", "root", "", {
  host: "104.155.153.160",
  dialect: "mysql",
});

export default db;
