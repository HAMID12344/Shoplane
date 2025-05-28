const express = require("express");
const { check } = require("express-validator");
const adminController = require("../controllers/adminController");
const Admin = require("../models/admin");
const isAdminauth = require("../middleware/isAdminAuth");

const adminRoutes = express.Router();

adminRoutes.get("/admin/login", adminController.adminLogin);
adminRoutes.post(
  "/admin/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Admin.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("Email does not exist");
          }
        });
      }),
  ],
  adminController.postAdminLogin
);
adminRoutes.get("/admin/signup", adminController.adminSignup);
adminRoutes.post(
  "/admin/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Admin.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      }),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password should be at least 5 characters long!"),
    check("cpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords should match!");
      }
      return true;
    }),
  ],
  adminController.postAdminSignup
);

adminRoutes.get(
  "/admin/dashboard",
  isAdminauth,
  adminController.getAdminDashboard
);

adminRoutes.post("/admin/logout", adminController.postLogout);

adminRoutes.get("/admin/products", isAdminauth, adminController.getProducts);
adminRoutes.get(
  "/admin/add-product",
  isAdminauth,
  adminController.getAddProduct
);
adminRoutes.post("/admin/add-product", adminController.postAddProduct);
adminRoutes.get(
  "/admin/product/:productId",
  isAdminauth,
  adminController.getProductDetails
);
adminRoutes.get(
  "/admin/delete-product/:productId",
  isAdminauth,
  adminController.deleteProduct
);
adminRoutes.get("/admin/orders", isAdminauth, adminController.getOrders);
adminRoutes.post(
  "/admin/search-product",
  isAdminauth,
  adminController.searchProduct
);

module.exports = adminRoutes;
