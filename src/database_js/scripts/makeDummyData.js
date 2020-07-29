var Users = require("../users/user");
var mongoose = require("mongoose");

(async () => {
  //connect to database
  var url = "mongodb://localhost:27017/mydb";

  mongoose.connect(url, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  var database = mongoose.connection;

  database.once("open", async () => {
    console.log("Connected to database");
    database.useDb("synthbase");
    const users = [
      { username: "johnsmith", password: "12345" },
      { username: "janesmith", password: "12345" },
      { username: "joshsmith", password: "12345" },
    ];

    try {
      for (const user of users) {
        await Users.create(user);
        console.log(`Created user ${user.username}`);
      }

      mongoose.disconnect();
    } catch (e) {
      console.error(e);
    }
  });

  database.on("error", () => {
    console.log("Error connecting to database!");
  });
})();
