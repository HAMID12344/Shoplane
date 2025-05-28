module.exports = (req, res, next) => {
  if (!req.session.Admin) {
    return res.redirect("/admin/login");
  }
  next();
};
