const express = require('express');
const Cart = require('../model/cartSchema');
const Book = require('../model/bookSchema');

const router = express.Router();

// ✅ Add to Cart
router.post("/add", async (req, res) => {
  try {
    const { email, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found." });

    let cart = await Cart.findOne({ email });

    // If user doesn’t have a cart yet, create one
    if (!cart) {
      cart = new Cart({ email, items: [] });
    }

    // Check if the book is already in the cart
    const alreadyInCart = cart.items.some((item) => item.bookId.toString() === bookId);
    if (alreadyInCart) {
      return res.json({ success: false, message: "Book already in cart." });
    }

    // Add book to cart
    cart.items.push({
    bookId: book._id,
    title: book.title,
    author: book.author,
    price: Number(book.price.toString().replace(/[^0-9.]/g, "")),
    image: book.image,
    });


    await cart.save();

    res.json({ success: true, message: "Book added to cart.", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ✅ Get user's cart
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const cart = await Cart.findOne({ email }).populate("items.bookId");
    if (!cart) return res.json({ success: true, items: [] });

    const formattedItems = cart.items.map((item) => ({
      bookId: item.bookId._id.toString(),  // <-- SAFE STRING ID
      title: item.title,
      author: item.author,
      price: item.price,
      image: item.image
    }));

    res.json({ success: true, items: formattedItems });

  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ✅ Remove an item from cart
router.post("/remove", async (req, res) => {
  try {
    const { email, bookId } = req.body;
    const cart = await Cart.findOne({ email });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

    cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId);
    await cart.save();

    res.json({ success: true, message: "Book removed from cart." });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
