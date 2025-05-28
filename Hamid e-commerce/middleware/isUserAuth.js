exports.IsLoggedIn = (req, res, next) => {
  if (req.session.User) {
    return res.redirect("/");
  }
  next();
};

exports.isCart = (req, res, next) => {
  if (!req.session.User) {
    return res.redirect("/login");
  }
  next();
};
