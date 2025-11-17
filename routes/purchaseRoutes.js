const express = require('express');
const axios = require('axios');
const Purchase = require('../model/purchaseSchema');
const User = require('../model/userSchema');
const Book = require('../model/bookSchema');
const PurchasedBook = require('../model/purchasedBookSchema');
const Cart = require('../model/cartSchema'); // Make sure you have a Cart model


const router = express.Router();

// POST /api/purchase — Create pending purchase and return redirect URL
router.post('/', async (req, res) => {
  try {
    const { email, items } = req.body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Email and items[] are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extract book IDs and total price
    const bookIds = items.map(i =>
      typeof i.bookId === "string" ? i.bookId : i.bookId._id
    );

    const totalPrice = items.reduce((sum, item) => {
      const p = parseFloat(item.price.toString().replace(/[^0-9.]/g, ""));
      return isNaN(p) ? sum : sum + p;
    }, 0);

    if (totalPrice <= 0)
      return res.status(400).json({ message: "Invalid price" });

    // Create purchase
    const purchase = await Purchase.create({
      userId: user._id,
      priceAtPurchase: totalPrice,
      transactionStatus: "pending",
    });

    // Build redirect URL
    const bankURL = process.env.PUBLIC_BANK_SERVER_URL || "http://localhost:6002";
    const toAccount = process.env.BOOKBOUND_ACCOUNT_NO || "123456789";

    const redirectURL =
      `${bankURL}/api/transaction?` +
      `amount=${totalPrice}&` +
      `purchaseId=${purchase._id}&` +
      `books=${bookIds.join(",")}&` +
      `email=${encodeURIComponent(email)}&` +
      `toAccount=${toAccount}`;

    return res.status(200).json({
      message: "Purchase initiated",
      redirectURL,
    });

  } catch (error) {
    console.error("Purchase Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});




// POST /api/purchase/check — Check if user already purchased the book
router.post('/check', async (req, res) => {
  const { email, bookId } = req.body;
  console.log("Checking purchase for email:", email, "and bookId:", bookId);

  if (!email || !bookId) {
    return res.status(400).json({ message: "Missing email or bookId" });
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ purchased: false });
    }

    console.log("Found user:", user);

    // Check purchase
    const existing = await PurchasedBook.findOne({
      userId: user._id,
      bookId
    });

    if (existing) return res.json({ purchased: true });
    return res.json({ purchased: false });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking purchase status' });
      }
    });

// POST /api/purchase/checkForAUser — return all purchased books info for a user
router.post('/checkForAUser', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find all purchased books
    const purchased = await PurchasedBook.find({ userId: user._id }).populate('bookId');

    // Map to frontend-friendly book info
    const books = purchased.map(p => ({
      _id: p.bookId._id,
      title: p.bookId.title,
      author: p.bookId.author,
      image: p.bookId.image,
      description: p.bookId.description,
      price: p.bookId.price,
      bookBoundLink: p.bookId.bookBoundLink || "",
    }));
    console.log("Purchased books for user:", email, books);

    res.json({ user: { name: user.name, email: user.email }, books });
  } catch (error) {
    console.error("Error fetching user's purchased books:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post('/history', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all purchases by user
    const purchases = await Purchase.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean(); // lean() for plain JS objects

    // Fetch all books purchased in each purchase
    const detailedPurchases = [];
    for (const purchase of purchases) {
      const purchasedBooks = await PurchasedBook.find({ purchaseId: purchase._id }).populate('bookId', 'title author image').lean();
      // Format books info
      const books = purchasedBooks.map(pb => ({
        _id: pb.bookId._id,
        title: pb.bookId.title,
        author: pb.bookId.author,
        image: pb.bookId.image
      }));
      detailedPurchases.push({
        ...purchase,
        books
      });
    }

    res.json({ purchases: detailedPurchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching purchase history" });
  }
});




// GET /api/purchase/complete — Mark purchase as completed, save purchased books, and clear from cart
router.get('/complete', async (req, res) => {
  try {
    const { purchaseId, status, books } = req.query;

    if (!purchaseId || !status) {
      return res.status(400).send('Missing purchaseId or status');
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).send('Purchase not found');

    if (status === 'completed') {
      purchase.transactionStatus = 'completed';
      await purchase.save();

      const bookIds = books ? books.toString().split(",") : [];

      // Save purchased books
      for (const bookId of bookIds) {
        const exists = await PurchasedBook.findOne({
          purchaseId,
          userId: purchase.userId,
          bookId,
        });
        if (!exists) {
          await PurchasedBook.create({
            purchaseId,
            userId: purchase.userId,
            bookId,
          });
        }
      }

      // Remove purchased books from the user's cart
      if (bookIds.length > 0) {
        await Cart.deleteMany({
          userId: purchase.userId,
          bookId: { $in: bookIds },
        });
      }
    }

    // Redirect to frontend profile page
    const FRONT = process.env.FRONTEND || 'http://localhost:3002';
    return res.redirect(`${FRONT}/profile`);

  } catch (error) {
    console.error("Purchase completion error:", error);
    return res.status(500).send("Server error while completing purchase");
  }
});






module.exports = router;
