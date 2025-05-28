const admin = require("../models/admin");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const product = require("../models/product");
const cloudinary = require("../util/cloudinary");
const Order = require("../models/order");

let isAdded = "null";
let isDeleted = false;
let isEdited = false;
let isApproved = false;
let isRejected = false;

exports.adminLogin = (req, res, next) => {
  res.render("admin/login", {
    errorMessage: null,
  });
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find().populate("products.productId");
  console.log(orders);
  res.render("admin/orders", {
    errorMessage: null,
    path: "orders",
    admin: {
      firstName: "Wasif",
      lastName: "Shahid",
    },
    orders: orders,
  });
};
exports.postAdminLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/login", {
        path: "/signin",
        pageTitle: "Signin",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: req.body.email,
          password: req.body.password,
        },
        validationErrors: errors.array(),
      });
    }

    const Admin = await admin.findOne({ email: email });

    let result = await bcrypt.compare(password, Admin.password);

    if (result) {
      req.session.Admin = Admin;
      req.session.isAdminLoggedIn = true;

      await req.session.save();
      return res.redirect("/admin/dashboard");
    }
    res.status(422).render("admin/login", {
      path: "/signin",
      pageTitle: "Signin",
      errorMessage: "Passwords Dont Match",
      oldInput: {
        email: req.body.email,
        password: req.body.password,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
exports.adminSignup = (req, res, next) => {
  res.render("admin/signup", {
    errorMessage: null,
    oldInput: {},
  });
};

exports.postAdminSignup = async (req, res, next) => {
  try {
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: req.body.email,
          password: req.body.password,
          cpassword: req.body.cpassword,
          lname: req.body.lname,
          fname: req.body.fname,
        },
        validationErrors: errors.array(),
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const Admin = new admin({
      firstName: req.body.fname,
      lastName: req.body.lname,
      email: req.body.email,
      password: hashedPassword,
      adminType: "Super-Admin",
    });
    const savedPass = await Admin.save();
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err);
  }
};

exports.getAdminDashboard = (req, res, next) => {
  res.render("admin/dashboard", {
    path: "dashboard",
    admin: {
      firstName: "Wasif",
      lastName: "Shahid",
    },
  });
};

exports.postLogout = (req, res, next) => {
  delete req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/admin/login");
};

exports.getProducts = (req, res, next) => {
  product
    .find({})
    .then((products) => {
      res.render("admin/product", {
        Prods: products,
        path: "products",
        admin: req.session.Admin,
        isArt: isAdded,
        isDel: isDeleted,
        isEdited: isEdited,
      });
    })
    .then(() => {
      if (isAdded === "true" || isAdded === "false") {
        isAdded = "null";
      }
      if (isDeleted) {
        isDeleted = false;
      }
      if (isEdited) {
        isEdited = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    path: "products",
    admin: req.session.Admin,
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { name, description, rating, quantity, category, price, brand } =
      req.body;

    const imageUrl = req.files;

    const uploadPromises = imageUrl.map((imagePath) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(imagePath.path, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });

    const results = await Promise.all(uploadPromises);

    let imageurl = [];

    for (let result of results) {
      imageurl.push(result.url);
    }

    const Product = new product({
      name: name,
      description: description,
      category: category,
      rating: rating,
      quantity: quantity,
      imageUrl: imageurl,
      price: price,
      brand: brand,
    });
    await Product.save();
    isAdded = "true";
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getProductDetails = async (req, res, next) => {
  console.log(req.params);

  const Prod = await product.findById(req.params.productId);
  console.log(Prod);
  res.render("admin/view-product", {
    Prod: Prod,
    path: "products",
    admin: req.session.Admin,
  });
};

exports.deleteProduct = async (req, res, next) => {
  console.log(req.params);

  const prod = await product.findByIdAndDelete(req.params.productId);
  console.log(product);
  isDeleted = true;
  res.redirect("/admin/products");
};

exports.searchProduct = async (req, res, next) => {
  const value = req.body.searchText[0];
  product
    .find({ name: { $regex: value, $options: "i" } })
    .then((result) => {
      res.render("admin/product", {
        Prods: result,
        path: "products",
        admin: req.session.Admin,
        isArt: isAdded,
        isDel: isDeleted,
        isEdited: isEdited,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
