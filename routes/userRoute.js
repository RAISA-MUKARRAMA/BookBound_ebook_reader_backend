const express = require('express');
const router = express.Router();
const User = require('../model/userSchema');
const Book = require('../model/bookSchema');
const Purchase = require('../model/purchaseSchema');

// GET user details by email (with purchased books)
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);

    // Fetch purchases made by this user
    const purchases = await Purchase.find({ userId: user._id }).lean();

    // Get all book IDs from purchases
    const purchasedBookIds = purchases.map(p => p.bookId);

    // Fetch book details for these purchased books
    const purchasedBooks = await Book.find({ _id: { $in: purchasedBookIds } }).lean();

    res.status(200).json({ user, purchasedBooks });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
