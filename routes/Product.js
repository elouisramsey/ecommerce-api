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
      return new Date().toISOString().replace(/:/g, '-') + file.originalname
    }
  }
})

const parser = multer({ storage: storage })

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
router.get('/getproductbyid/:product_id', async (req, res) => {
  const { similarProducts } = req.query
  try {
    const product = await Product.findById(req.params.product_id)
    const similarItems = await Product.aggregate([
      { $match: { category_id: product.category_id } },
      { $sample: { size: 4 } }
    ])

    if (similarProducts && similarProducts === 'true') {
      res.json({
        product: product,
        pageName: 'Product Details',
        similarProducts: similarItems
      })
    } else {
      res.json({
        product: product,
        pageName: 'Product Details'
      })
    }
    // console.log(similarItems)
  } catch (err) {
    return res.status(500).send('There was an error getting this product.')
  }
})

// get all products
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  try {
    const allProducts = await Product.find()
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
    const count = await Product.countDocuments()

    res.json({
      pageName: 'All available products',
      products: allProducts,
      currentPage: page,
      pages: Math.ceil(count / limit),
      numberOfProducts: count
    })
  } catch (err) {
    return res.status(500).send('There was an error getting all products.')
  }
})

// get all products by name
router.get('/getproductbyname/search', async (req, res) => {
  const name = req.query.name
  const regex = new RegExp(name, 'i')

  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  try {
    const product = await Product.find({
      name: regex
    })
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .exec()

    const count = await Product.count({
      name: regex
    })

    res.json({
      products: product,
      pageName: 'Search Results',
      currentPage: page,
      pages: Math.ceil(count / limit),
      numberofProducts: count
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all products with this name.')
  }
})

// get all toprated products
router.get('/toprated', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  const rating = req.query.rating || 4
 
  try {
    const product = await Product.find({ ratings: { $gte: rating } })
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .exec()

    const count = await Product.count({ ratings: { $gte: rating } })

    res.json({
      products: product,
      pageName: 'Top rated products',
      currentPage: page,
      pages: Math.ceil(count / limit),
      numberofProducts: count
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all toprated products.')
  }
})

// get all topsales products
router.get('/topsales', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1
  
  const sales = req.query.sales || 100

  try {
    const product = await Product.find({ sales: { $gte: sales } })
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .exec()

    const count = await Product.count({ sales: { $gte: sales } })

    res.json({
      products: product,
      pageName: 'Top sold products',
      currentPage: page,
      pages: Math.ceil(count / limit),
      numberofProducts: count
    })
    
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
