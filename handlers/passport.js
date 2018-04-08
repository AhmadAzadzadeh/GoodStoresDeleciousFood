const mongoose = require("mongoose");
const passport = require("passport");
const User = mongoose.model("user");


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());