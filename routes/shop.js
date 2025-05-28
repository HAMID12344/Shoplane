const express = require("express");
const shopController = require("../controllers/shopController");
const { check } = require("express-validator");
const user = require("../models/user");
const shopRoutes = express.Router();
const isChecker = require("../middleware/isUserAuth");
const csrfDSC = require("express-csrf-double-submit-cookie");
// create middleware
const csrfProtection = csrfDSC();

shopRoutes.get("/", shopController.getHomePage);
shopRoutes.get("/home", shopController.getFilteredHomePage);
shopRoutes.get("/products", shopController.getAllProducts);
shopRoutes.post("/add-to-cart", shopController.postAddToCart);
shopRoutes.get("/login", isChecker.IsLoggedIn, shopController.getLoginPage);
shopRoutes.get("/logout", shopController.getLogoutPage);
shopRoutes.get("/checkout", isChecker.isCart, shopController.getCheckoutPage);
shopRoutes.get("/checkout/success", shopController.getCheckoutSuccessPage);
shopRoutes.get("/clear-cart/:userId", shopController.getClearCart);
shopRoutes.get("/product-detail/:productId", shopController.getOptions);
shopRoutes.get("/brands", shopController.getBrands);
shopRoutes.get("/orders", shopController.getOrders);
shopRoutes.get("/order-details/:id", shopController.getOrderDetails);
shopRoutes.post(
  "/process-checkout",
  isChecker.isCart,
  shopController.postCheckout
);
shopRoutes.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return user.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("Email does not exist");
          }
        });
      }),
  ],
  shopController.postUserLogin
);
shopRoutes.get("/signup", shopController.getSignupPage);
shopRoutes.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return user.findOne({ email: value }).then((userDoc) => {
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
  shopController.postUserSignup
);
shopRoutes.get("/signup/getOTP", shopController.emailChecker);
shopRoutes.get("/verified", shopController.userVerified);
shopRoutes.get("/product-category", shopController.getCategoryPage);

module.exports = shopRoutes;
