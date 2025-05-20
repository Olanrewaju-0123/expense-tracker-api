const express = require("express");
const router = express.Router();
const {
  createUser,
  verifyEmail,
  login,
  createCatogories,
  updateCatogories,
  createTransaction,
  getFilteredTransaction
} = require("../controllers/user");
const { authorization } = require("../middlewares/authorisation");
router.post("/user", createUser);

router.patch("/verify-email/:email/:otp", verifyEmail);

router.post("/user/login", login);

// create or Add Categories
router.post("/categories/create", authorization, createCatogories);

//  update a category
router.put("/categories/:id", authorization, updateCatogories);

// create a Transaction
router.post("/transactions", createTransaction)

// get a list of Transaction
router.get("/transactions/lists", getFilteredTransaction)



module.exports = router;
