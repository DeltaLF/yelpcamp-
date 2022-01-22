if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const userRouter = require("./routes/users");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const MongoDBStore = require("connect-mongo");

const db_url = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(db_url);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});
const app = express();

app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const sessionConfig = {
  store: MongoDBStore.create({
    mongoUrl: db_url,
    secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure:true,  // cookie only used in https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week
    magAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // User.authenticate comes with passport

passport.serializeUser(User.serializeUser()); // how to store
passport.deserializeUser(User.deserializeUser()); // how to unstore

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.use("/", userRouter);
app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found"), 404);
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong!";
  res.status(statusCode);
  res.render("error", { err });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`running on port ${port}`);
});
