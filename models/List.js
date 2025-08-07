const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [
    {
      name: String,
      quantity: String,
      completed: Boolean
    }
  ]
});

module.exports = mongoose.model("List", ListSchema);
