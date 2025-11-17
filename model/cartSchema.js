const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      title: String,
      author: String,
      price: Number,
      image: String,
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);
