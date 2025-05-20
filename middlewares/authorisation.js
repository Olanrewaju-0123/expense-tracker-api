const jwt = require("jsonwebtoken");
const {Users} = require("../models/user.model");

const authorization = (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) throw new Error("Unauthorised Access");
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // console.log("err", err);
        return res.status(401).json({
            
          status: "error",
          message: "Unauthorised Access",
        });
      }

      const email = decoded.email;
      //use the email to fetch the user_id
      const data = await Users.findOne({ where: { email: email } });
      if (data == null) {
        // console.log("data", data);
        return res.status(401).json({
          status: "error",
          message: "Unauthorised Access",
        });
      }
      req.user = {
        user_id: data.user_id,
        email: data.email,
      };

      // req.params.user_id = data.user_id
      // req.params.email = data.email
      next();
    });
  } catch (error) {
    // console.log("error", error);
    res.status(401).json({
      status: "error",
      message: "Unauthorised Access",
    });
  }
};

module.exports = {
  authorization,
};
