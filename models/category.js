const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema(
  {
    id: mongoose.ObjectId,
    category_name: {
      type: String,
      required: [
        true,
        'Please enter a category. E.g: Gadgets, Home appliances, Furnitures, Toys'
      ],
      trim: true,
      minlength: 2
    },
    category_id: {
      type: String,
      required: [
        true,
        'Please enter a category id. E.g: Gadgets, Home appliances, Furnitures, Toys'
      ],
      trim: true,
      minlength: 2
    },
    image: [
      {
        type: String,
        // required: true
      }
    ],
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Category', categorySchema)
