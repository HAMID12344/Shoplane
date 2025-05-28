const express = require("express");
const user = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const product = require("../models/product");
const { IsLoggedIn } = require("../middleware/isUserAuth");
const stripe = require("stripe")(
  "sk_test_51OfKKxIMu6keChZRitqe2ULOiMUg32MGI20c1DK4S2lHyWEMhTPlxrFNIBMl9hSICoMGxfvGmNEvGzutNeR1lNXf00hYcYmIjE"
);
const Order = require("../models/order");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "SG.agTqkwgWSxi-xaSUMUxUew.tyMpelxYURtGVVEjtjj5ddaMP44Sm-ZhP2V4NIUH-DY"
);

async function updateBrandForBeats() {
  try {
    const result = await product.updateMany(
      { name: /Apple/i }, // Match products where the name includes "Beats" (case-insensitive)
      { $set: { Brand: "Apple" } } // Set the Brand field to "Beats"
    );
    console.log(`${result.modifiedCount} products updated successfully.`);
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

const updateProductQuantities = async (cartItems) => {
  for (const item of cartItems) {
    const Product = await product.findById(item.productId);
    if (Product) {
      if (Product.quantity - item.quantity < 0) {
        throw new Error(
          `Insufficient stock for product: ${Product.name}. Only ${Product.quantity} left.`
        );
      }
      Product.quantity -= item.quantity; // Decrease the product quantity
      await Product.save();
    }
  }
};

let PRODUCTS_PER_PAGE = 8;
exports.getHomePage = async (req, res, next) => {
  console.log("User", req.session?.isUserLoggedIn);
  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId")
      .limit(8);

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  const products = await product.find({}).limit(8);
  let description = products.map((prod) => {
    return prod.description.slice(0, 50).concat("...");
  });

  res.render("shop/home", {
    userIsLoggedIn: req.session.isUserLoggedIn,
    Prods: products,
    descriptions: description,
    totalPrice: totalPrice.toFixed(2),
    cart: items || [],
    User: req.session?.User,
    isClear: req.session?.isClear == true ? true : false,
  });
  if (req.session?.isClear == true) {
    req.session.isClear = false;
    await req.session.save();
  }
};
exports.getFilteredHomePage = async (req, res, next) => {
  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId");

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
        isClear: req.session?.isClear == true ? true : false,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  if (req?.query?.price === "low") {
    const products = await product.find({}).sort({ price: 1 }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.price === "high") {
    const products = await product.find({}).sort({ price: -1 }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.price == 10) {
    const products = await product.find({ price: { $lt: 10 } }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.price == 50) {
    const products = await product.find({ price: { $lt: 50 } }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.price == 100) {
    const products = await product.find({ price: { $gt: 100 } }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.review == 3) {
    const products = await product.find({ price: { $lte: 3 } }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  } else if (req?.query?.review == 4) {
    const products = await product.find({ rating: { $gte: 4 } }).limit(8);
    let description = products.map((prod) => {
      return prod.description.slice(0, 50).concat("...");
    });
    res.render("shop/home", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      Prods: products,
      descriptions: description,
      totalPrice: totalPrice.toFixed(2),
      cart: items || [],
      User: req.session?.User,
      isClear: req.session?.isClear == true ? true : false,
    });
  }

  req.session.isClear = false;
};
exports.getLoginPage = (req, res, next) => {
  res.render("shop/login", {
    errorMessage: null,
  });
};
exports.getLogoutPage = async (req, res, next) => {
  await req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/login");
};
exports.getSignupPage = (req, res, next) => {
  res.render("shop/signup", {
    oldInput: {},
    errorMessage: null,
  });
};
exports.getClearCart = async (req, res, next) => {
  const User = await user.findById(req.session.User._id);
  console.log(User);
  User.cart.items = [];
  await User.save();
  req.session.User = User;
  req.session.isClear = true;
  await req.session.save();
  res.redirect("/");
};
exports.postUserSignup = async (req, res, next) => {
  try {
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("shop/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: req.body.email,
          password: req.body.password,
          cpassword: req.body.cpassword,
        },
        validationErrors: errors.array(),
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const User = {
      firstName: "ignore",
      email: req.body.email,
      password: hashedPassword,
    };

    res.redirect("/signup/getOTP?user=" + new URLSearchParams(User));
  } catch (err) {
    console.log(err);
  }
};

exports.postUserLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("shop/login", {
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

    const User = await user.findOne({ email: email });

    let result = await bcrypt.compare(password, User.password);

    if (result) {
      req.session.User = User;
      req.session.isUserLoggedIn = true;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).send("Internal Server Error");
        }
        return res.redirect("/"); // Redirect after the session is saved
      });
    } else {
      res.status(422).render("shop/login", {
        path: "/signin",
        pageTitle: "Signin",
        errorMessage: "Passwords Dont Match",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getOptions = async (req, res, next) => {
  try {
    let items;
    let totalPrice = 0;
    if (req.session?.User) {
      const User = await user
        .findById(req.session?.User?._id)
        .populate("cart.items.productId");

      const cartItems = User.cart.items.map((item) => {
        return {
          name: item.productId.name, // Replace with actual product field names
          price: item.productId.price,
          imageUrl: item.productId.imageUrl,
          quantity: item.quantity,
          category: item.productId.category,
          totalPrice: item.quantity * item.productId.price,
        };
      });
      items = cartItems;
      for (let item of items) {
        console.log(item.totalPrice, totalPrice);
        totalPrice = item.totalPrice + totalPrice;
      }
    }

    const Product = await product.findById(req.params.productId);
    res.render("shop/product", {
      userIsLoggedIn: req.session.isUserLoggedIn,
      prod: Product,
      quantity: Product.quantity,
      cart: items || [],
      User: User,
      totalPrice: totalPrice.toFixed(2),
      isShow: req.session?.isTrue == true ? true : false,
    });
    req.session.isTrue = false;
    await req.session.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const User = require("../models/user"); // Adjust the path based on your file structure
const Product = require("../models/product"); // Assuming you have a Product model

exports.postAddToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId; // Get the product ID from the request
    const quantity = parseInt(req.body.quantity); // Get the quantity from the request
    const userId = req.session?.User?._id; // Assuming you have user sessions

    const User = await user.findById(userId);

    if (!User) {
      return res.redirect("/login"); // Redirect to login if user not found
    }

    // Check if the product is already in the cart
    const cartProductIndex = User.cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    let updatedCartItems = [...User.cart.items];

    if (cartProductIndex >= 0) {
      // If product exists in the cart, update the quantity
      updatedCartItems[cartProductIndex].quantity += quantity;
    } else {
      // If product doesn't exist, add it to the cart
      updatedCartItems.push({ productId, quantity });
    }

    // Update the user's cart
    User.cart.items = updatedCartItems;
    req.session.isTrue = true;
    await req.session.save();
    await User.save();

    res.redirect(`/product-detail/${productId}`); // Redirect to the cart page after updating
  } catch (err) {
    console.error(err);
    // Pass error to the next middleware
  }
};

exports.getCategoryPage = async (req, res, next) => {
  let items;
  let totalPrice = 0;
  let nextpages;
  let Prods;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId");

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  let totalProducts;

  const page = +req.query.page || 1; // Current page from query, default to 1
  console.log(page);

  product
    .find({ category: req.query.category })
    .countDocuments()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find({ category: req.query.category })
        .skip((page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
    })
    .then((products) => {
      const nextPages = [];
      for (let i = 1; i <= 2; i++) {
        if (page + i <= Math.ceil(totalProducts / PRODUCTS_PER_PAGE)) {
          nextPages.push(page + i);
        }
      }
      nextpages = nextPages;
      Prods = products;
    })
    .then(() => {
      res.render("shop/category-products", {
        cart: items || [],
        totalPrice: totalPrice.toFixed(2),
        User: req.session?.User,
        userIsLoggedIn: req.session.isUserLoggedIn,
        currentPage: page,
        hasNextPage: PRODUCTS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPages: nextpages,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / PRODUCTS_PER_PAGE),
        products: Prods,
      });
    });
};

exports.getCheckoutPage = async (req, res, next) => {
  let totalPrice = 0;
  const User = await user
    .findById(req.session?.User?._id)
    .populate("cart.items.productId");
  const cart = User.cart.items.map((item) => {
    const { productId, quantity } = item;
    return {
      name: productId.name,
      image: productId.imageUrl,
      quantity: quantity,
      price: productId.price * quantity, // Calculate total price for the item
    };
  });

  for (let item of cart) {
    totalPrice = item.price + totalPrice;
  }

  res.render("shop/checkout", {
    email: req.session.User.email,
    cart: cart,
    totalPrice: totalPrice.toFixed(2),
    shipping: 5.99,
    totalPriceWithShipping: (totalPrice + 5.99).toFixed(2),
  });
};

exports.postCheckout = async (req, res, next) => {
  const User = await user
    .findById(req.session?.User._id)
    .populate("cart.items.productId");
  const cart = User.cart.items.map((item) => {
    const { productId, quantity } = item;
    return {
      name: productId.name,
      image: productId.imageUrl,
      quantity: quantity,
      description: productId.description,
      price: productId.price + 5.99, // Calculate total price for the item
    };
  });
  const lineItems = cart.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        description: product.description,
        images: product.image,
      },
      unit_amount: Math.round(product.price * 100), // Convert to cents
    },
    quantity: product.quantity,
  }));

  console.log("The body", req.body);
  console.log("lineItems", lineItems);

  req.session.cInfo = {
    address: req.body.address,
    totalPrice: req.body.total,
    phone: req.body.phone,
    paymentMethod: req.body.paymentMethod,
  };

  await req.session.save();

  if (req.body.paymentMethod === "COD") {
    return res.redirect("/checkout/success");
  } else {
    const YOUR_DOMAIN = "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/checkout/success`,
      cancel_url: `${YOUR_DOMAIN}/checkout`,
    });

    res.redirect(303, session.url);

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   mode: "payment",
    //   invoice_creation: {
    //     enabled: true,
    //   },
    //   line_items: cart.map((p) => {
    //     return {
    //       quantity: 10,
    //       price_data: {
    //         currency: "pkr",
    //         unit_amount: Math.round(p.price * 100),

    //         product_data: {
    //           name: 'hahds',
    //           description: p.description,
    //         },
    //       },
    //     };
    //   }),
    //   customer_email: req.session.User.email,

    //   success_url: req.protocol + "://" + req.get("host") + "/",
    //   cancel_url: req.protocol + "://" + req.get("host") + "/admin/login",
    // });
  }
}; // Assuming you have the Order model imported

exports.getCheckoutSuccessPage = async (req, res, next) => {
  try {
    // Find the user based on the session
    const User = await user.findById(req.session.User._id);

    if (!User || User.cart.items.length === 0) {
      return res.redirect("/cart"); // Redirect if there's no valid user or no items in the cart
    }

    // Create the order data
    const order = new Order({
      user: {
        userId: User._id,
        email: User.email,
      },
      products: User.cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      totalPrice: req.session.cInfo.totalPrice,
      status: "Pending",
      orderNumber: Math.floor(Math.random() * 1000000),
      address: req.session.cInfo.address,
      phone: req.session.cInfo.phone,
      paymentMethod: req.session.cInfo.paymentMethod, // Default status
    });

    // Save the order
    await order.save();

    updateProductQuantities(User.cart.items);

    // Clear the user's cart
    User.cart.items = [];
    await User.save();

    // Update session data
    req.session.User = User;
    req.session.cInfo = null;
    await req.session.save();

    // Render the success page
    res.render("shop/checkout-success");
  } catch (error) {
    console.error("Error processing checkout success:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

exports.getAllProducts = async (req, res, next) => {
  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId")
      .limit(8);

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  const products = await product.find({});
  console.log(products);
  res.render("shop/all-products", {
    userIsLoggedIn: req.session?.isUserLoggedIn,
    Prods: products,

    totalPrice: totalPrice.toFixed(2),
    cart: items || [],
    User: req.session?.User,
  });
};

exports.getBrands = async (req, res, next) => {
  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId")
      .limit(8);

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }
  const products = await product.find({ Brand: req.query.brand });

  console.log(products);

  res.render("shop/brands", {
    userIsLoggedIn: req.session?.isUserLoggedIn,
    products: products,

    totalPrice: totalPrice.toFixed(2),
    cart: items || [],
    User: req.session?.User,
  });
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find({
    "user.userId": req.session.User._id,
  }).populate("products.productId");

  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId")
      .limit(8);

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  res.render("shop/orders", {
    errorMessage: null,
    path: "orders",
    admin: {
      firstName: "Wasif",
      lastName: "Shahid",
    },
    orders: orders,
    User: req.session?.User,
    totalPrice: totalPrice.toFixed(2),
    userIsLoggedIn: req.session?.isUserLoggedIn,
    cart: items || [],
  });
};

exports.getOrderDetails = async (req, res, next) => {
  let items;
  let totalPrice = 0;
  if (req.session?.User) {
    const User = await user
      .findById(req.session?.User?._id)
      .populate("cart.items.productId")
      .limit(8);

    const cartItems = User.cart.items.map((item) => {
      return {
        name: item.productId.name, // Replace with actual product field names
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        category: item.productId.category,
        totalPrice: item.quantity * item.productId.price,
      };
    });
    items = cartItems;
    for (let item of items) {
      console.log(item.totalPrice, totalPrice);
      totalPrice = item.totalPrice + totalPrice;
    }
  }

  const order = await Order.findById(req.params.id).populate(
    "products.productId"
  );

  res.render("shop/order-details", {
    order: order,
    user: req.session?.User,
    userIsLoggedIn: req.session?.isUserLoggedIn,
    cart: items || [],
    totalPrice: totalPrice.toFixed(2),
    User: req.session?.User,
  });
};

exports.emailChecker = (req, res, next) => {
  console.log(req.query);
  const User = {
    email: req.query.email,
    password: req.query.password,
  };
  const name = "Wasif";
  const email = req.query.email;
  const verificationCode = String(Math.floor(10000 + Math.random() * 90000));

  const dynamicTemplateData = {
    verification_code_digits: verificationCode.split(""),
    name: name,
  };
  const msg = {
    to: email, // recipient email
    from: {
      email: "wasif.shahid8@gmail.com",
      name: "TechStore",
    }, // sender email
    templateId: "d-882c8928e6684422ac6bb4e957dfb218",
    dynamicTemplateData: {
      verification_code_digits: dynamicTemplateData.verification_code_digits,
      name: dynamicTemplateData.name, // Assuming `dynamicTemplateData` contains the name
    },
  };

  // Send the email
  sgMail
    .send(msg)
    .then(() => {
      req.session.tempUser = User;
      return req.session.save(() => {
        res.render("shop/otp", {
          verificationCode: verificationCode,
        });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("Error sending verification code.");
    });
};

exports.userVerified = (req, res, next) => {
  const { email, password } = req.session.tempUser;
  const User = new user({
    email: email,
    password: password,
    cart: { items: [] },
  });
  User.save()
    .then((result) => {
      res.render("shop/verified");
    })
    .catch((err) => {
      console.log(err);
    });
};
