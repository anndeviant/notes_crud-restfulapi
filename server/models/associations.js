import User from "./UserModel.js";
import Note from "./Note.js";

// Set up associations between models
const setupAssociations = () => {
  User.hasMany(Note, { foreignKey: "userId" });
  Note.belongsTo(User, { foreignKey: "userId" });

  console.log("Model associations established successfully");
};

export default setupAssociations;
