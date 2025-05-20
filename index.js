require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
// const displayRoutes = require("express-routemap");
const port = process.env.APP_PORT || 3000;
const sequelize = require("./config/sequelize");
const userRoutes = require("./routes/user");

app.use(express.json());
app.use(cors());

app.use(userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Expense Tracker API",
});
});

try {
  (async () => {
      await sequelize.authenticate();
      await sequelize.sync({force: true});
      console.log("Connection has been established successfully.");
    app.listen(port, () => {
    //   displayRoutes(app);
      // displayRoutes(app)
      console.log(`Expenses app listening on port ${port}`);

      // cron.schedule('* * * * *', () => {
      //   console.log('running a task every minute');
      //   crawlAndUpdateUtilityStatus()

      // });
    });
  })();

  // sequelize.authenticate()
  // .then(() => {
  //   console.log('Connection has been established successfully.');
  //   app.listen(port, () => {
  //     displayRoutes(app)
  //     console.log(`Example app listening on port ${port}`)
  //   })
  // })
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}
