const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const List = require("../models/List");

// Get all current items
router.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Add new item
router.post("/items", async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.json(newItem);
});

// Update item (edit or toggle complete)
router.put("/items/:id", async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});

// Delete item
router.delete("/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Save current list as previous
router.post("/lists", async (req, res) => {
  const newList = new List(req.body);
  await newList.save();
  await Item.deleteMany({}); // clear current items
  res.json(newList);
});

// Get all previous lists
router.get("/lists", async (req, res) => {
  const lists = await List.find();
  res.json(lists);
});

// Load a previous list into current
router.post("/lists/load/:id", async (req, res) => {
  const list = await List.findById(req.params.id);
  if (list) {
    await Item.deleteMany({});
    await Item.insertMany(list.items);
    res.json({ success: true, items: list.items });
  } else {
    res.status(404).json({ error: "List not found" });
  }
});

module.exports = router;
