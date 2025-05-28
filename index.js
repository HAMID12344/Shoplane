const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const MongoDBstore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const csurf = require("tiny-csrf");

const app = express();

app.use(cookieParser("cookie-parser-secret"));

const Store = new MongoDBstore({
  uri: "mongodb+srv://wasifshahid11:v1d7JemxuFyvkuE3@cluster1.mkw6cpt.mongodb.net/TechStore",
  collection: "sessions",
  expires: 1.5 * 60 * 60 * 1000,
});

app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/enc"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: "true" }));

// app.use(
//   csurf(
//     "123456789iamasecret987654321look", // secret -- must be 32 bits or chars in length
//     ["POST"], // the request methods we want CSRF protection for
//     ["/detail", /\/detail\.*/i], // any URLs we want to exclude, either as strings or regexp
//     [process.env.SITE_URL + "/service-worker.js"] // any requests from here will not see the token and will not generate a new one
//   )
// );

app.use(
  multer({ storage: fileStorage, fileFilter: filefilter }).array("imageURL[]")
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: Store,
  })
);

// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();

//   next();
// });

// Test route
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// Using shop routes
app.use(shopRoutes);
app.use(adminRoutes);
app.get("/clothing/sports", (req, res) => {
  res.render("shop/clothing", { pageTitle: "Clothing" });
});
app.get("/clothing/casual", (req, res) => {
  res.render("shop/casual", { pageTitle: "Clothing" });
});
app.use(errorController.get404);
// app.use((error, req, res, next) => {
//   res.redirect("/");
// });

mongoose
  .connect(
    "mongodb+srv://wasifshahid11:v1d7JemxuFyvkuE3@cluster1.mkw6cpt.mongodb.net/TechStore"
  )
  .then(() => {
    console.log("Database Connected!");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
