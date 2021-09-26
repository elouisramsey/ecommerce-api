const mongoose = require('mongoose')
const productSchema = new mongoose.Schema(
  {
    id: mongoose.ObjectId,
    category: {
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
        required: true
      }
    ],
    description: {
      type: String,
      required: [true, 'Kindly describe your product'],
      trim: true,
      minlength: 10
    },
    name: {
      type: String,
      required: [true, 'E.g: Brown Leather Chair'],
      trim: true,
      minlength: 4
    },
    type: {
      type: String,
      required: [
        true,
        'The type pf product. E.G Cat Food, HouseHold equipment'
      ],
      trim: true,
      minlength: 4
    },
    color: {
      type: String,
      required: [true, 'Enter item color'],
      trim: true,
      minlength: 3
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      trim: true,
      minlength: 2,
      maxlength: 3
    },
    stock: {
      type: Number,
      required: [true, 'Please add availble quantity'],
      trim: true
    },
    sales: {
      type: Number,
      required: [true, 'Please add number of products sold'],
      trim: true
    },
    ratings: {
      type: Number,
      required: [true, 'Please add number of ratings'],
      trim: true
    },
    reviews: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Product', productSchema)
