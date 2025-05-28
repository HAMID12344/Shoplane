const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
