const router = require("express").Router();
const Account = require("../models/Account");

// Get the single profile
router.get("/", async (req, res) => {
  try {
    let doc = await Account.findOne();
    if (!doc) {
      doc = await Account.create({ businessName: "Your Business Name" });
    }
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch account", error: e.message });
  }
});

// Create/Update profile (upsert)
router.put("/", async (req, res) => {
  try {
    const update = req.body || {};
    const doc = await Account.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to save account", error: e.message });
  }
});

module.exports = router;
