import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

// Remove User import to avoid circular dependency
const Note = db.define(
  "notes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("Penting", "Biasa", "Rendah"),
      allowNull: false,
      defaultValue: "Biasa",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Remove associations here - will be set up in a separate file

export default Note;

(async () => {
  await db.sync();
})();
