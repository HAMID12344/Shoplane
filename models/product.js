const mongoose = require("mongoose");

const schema = mongoose.Schema;

const productSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  imageUrl: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  Brand: {
    type: String,
  },
});

module.exports = mongoose.model("Product", productSchema);
