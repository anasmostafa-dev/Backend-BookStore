const mongoose = require("mongoose");
const valid = require("validator");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (val) => {
        return valid.isEmail(val);
      },
      message: "valid email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  role: {
    type: String,
    default: "user"
  }
});

module.exports = mongoose.model("User", UserSchema);
