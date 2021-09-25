const router = require('express').Router()
const Product = require('../models/product')

const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerceAPI',
    upload_preset: 'ecommerceAPI',
    format: async (req, file) => {
      'jpg', 'png', 'JPG', 'jpeg'
    }, // supports promises as well
    public_id: (req, file) => {
      console.log(
        new Date().toISOString().replace(/:/g, '-') + file.originalname
      )
      return new Date().toISOString().replace(/:/g, '-') + file.originalname
    }
  }
})

const parser = multer({ storage: storage })

function pagination(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (error) {
      res.status(500).json({ message: 'Error paginating' })
    }
  }
}

// add new product
router.post('/', parser.array('image'), async (req, res) => {
  const {
    description,
    name,
    type,
    stock,
    sales,
    price,
    category_id,
    ratings,
    reviews,
    category,
    color
  } = req.body

  try {
    // Create new product
    const item = new Product({
      description,
      name,
      type,
      stock,
      sales,
      price,
      category_id,
      ratings,
      reviews,
      category,
      color
    })
    if (req.files) {
      // if you are adding multiple files at a go
      const imageURIs = [] // array to hold the image urls
      const files = req.files // array of images
      for (const file of files) {
        const { path } = file
        imageURIs.push(path)
      }

      item.image = imageURIs // add the urls to object

      // Save user
      await item.save()
      res.json(item)
    }
  } catch (err) {
    console.error('server error occur', err.message)

    return res.status(401).send('There was an error creating product.')
  }
})

// get single product
router.get('/products/:product_id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.product_id)
    res.json(product)
  } catch (err) {
    console.log(err)
    return res.status(500).send('There was an error getting this product.')
  }
})

// get all products
router.get('/products', pagination(Product), (req, res) => {
  res.json(res.paginatedResults)
})

// get all products by name
router.get('/searchterm=:productName', async (req, res) => {
  const name = req.params.productName
  const regex = new RegExp(name, 'i')
console.log(regex);
    const perPage = 8
    let page = parseInt(req.query.page) || 1

  try {
    const product = await Product.find({
      name:  regex 
    })
      .sort('-createdAt')
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('category')
      .exec()

 const count = await Product.count({
   title: regex
 })

    res.json({
      products: product,
      pageName: 'Search Results',
      current: page,
      pages: Math.ceil(count / perPage)
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all products with this name.')
  }
})

// get all toprated products
router.get('/products/toprated', async (req, res) => {
  try {
    const product = await Product.find({ ratings: { $gte: 3 } })
    res.json(product)
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all toprated products.')
  }
})

// get all topsales products
router.get('/products/topsales', async (req, res) => {
  try {
    const product = await Product.find({ sales: { $gte: 100 } })
    res.json(product)
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all topsales products.')
  }
})

// delete a product
// router.delete('/:id', async (req, res) => {
//   try {
//     // find product by id
//     const product = await Product.findById(req.params.id)
//     // delete image from cloudinary
//     await cloudinary.uploader.destroy(product.cloudinary_id)
//     // delete product from db
//     await product.remove()
//   } catch (err) {
//     return res.status(500).send('There was an error deleting product.')
//   }
// })

module.exports = router
