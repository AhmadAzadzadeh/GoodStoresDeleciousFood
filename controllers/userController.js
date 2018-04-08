const mongoose = require("mongoose");
const promisify = require("es6-promisify");
const User = mongoose.model("User");

// GET /login
exports.loginForm = (req, res) => {
    res.render('login', { title: "Login" });
};

// GET /register
exports.registerForm = (req, res) => {
    res.render('register', { title: "Register" });
};

// Middleware
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You Must Supply a name!').notEmpty();
    req.checkBody('email', 'That Email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('password_confirm', "Confirm Password Cannot be Blank!").notEmpty();
    req.checkBody('password-confirm', 'Your Passwords do not match!').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash("error", errors.map(err => err.msg));
        res.render('register', { title: "Register", body: req.body, flashes: req.flash() });
        return;
    }
    next(); // we don't have any error
};

// Middleware
exports.register = async (req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name });
    // User.register(user, req.body.password, function(err, user) {}); // First Choice To Write
    // The Second One is:
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    next(); // pass to authController.login
};

// GET /account
exports.account = (req, res) => {
    res.render("account", { title: "Edit Your Account" });
};

// POST /account
exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };
    const user = User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' }
    );
    req.flash('success', 'Updated the Profile!');
    res.redirect('back');
};