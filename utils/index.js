const bcrypt = require("bcrypt");
const saltRound = 10;

const generateOtp = () => {
  //generate 6 digit otp
  return Math.floor(100000 + Math.random() * 900000);
};

const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRound, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve([hash, salt]);
      });
    });
  });
};

let lastCategoryId = 0;
const category_id = ()=> {
  lastCategoryId += 1;
  return lastCategoryId;
  
}

module.exports = {
  generateOtp,
  hashPassword,
  category_id
};
