const router = require('express').Router()
const Category = require('../models/category')
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

// add new category
router.post('/', parser.array('image'), async (req, res) => {
  const { category_name, category_id } = req.body

  try {
    // Create new category
    const item = new Category({
      category_id,
      category_name
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

// get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch (err) {
    return res.status(500).send('There was an error getting categories.')
  }
})

// get all products by category
router.get('/getitemcategory/getCategory=:category', async (req, res) => {
  const category = req.params.category
  const regex = new RegExp(category, 'i')

  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  try {
    const foundCategory = await Category.findOne({
      category: regex.category_id
    })

    const allProducts = await Product.find()
      .where('category_id')
      .equals(regex)
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .populate('category')

    const count = await Product.countDocuments({ category_id: regex })

    res.json({
      pageName: foundCategory.category_name,
      currentCategory: foundCategory,
      products: allProducts,
      current: page,
      pages: Math.ceil(count / limit)
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all products in this category.')
  }
})

// get all top rated products in each category
router.get('/:nameofcategory/toprated', async (req, res) => {
  const category = req.params.nameofcategory
  const regex = new RegExp(category, 'i')
  console.log(regex)
  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  try {
    const foundCategory = await Category.findOne({
      category_id: regex
    })

    const allProducts = await Product.find({
      $and: [{ category_id: regex }, { ratings: { $gte: 4 } }]
    })
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .populate('category')

    const count = await Product.countDocuments({
      $and: [{ category_id: regex }, { ratings: { $gte: 4 } }]
    })
    res.json({
      pageName: foundCategory.category_name,
      currentCategory: foundCategory,
      products: allProducts,
      current: page,
      pages: Math.ceil(count / limit)
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all top rated products in this category.')
  }
})

// get all top sold products in each category
router.get('/:nameofcategory/topsales', async (req, res) => {
  const category = req.params.nameofcategory
  const regex = new RegExp(category, 'i')
  console.log(regex)
  const limit = parseInt(req.query.limit) || 100
  let page = parseInt(req.query.page) || 1

  try {
    const foundCategory = await Category.findOne({
      category_id: regex
    })

    const allProducts = await Product.find({
      $and: [{ category_id: regex }, { sales: { $gte: 100 } }]
    })
      .sort('-createdAt')
      .skip(limit * page - limit)
      .limit(limit)
      .populate('category')

    const count = await Product.countDocuments({
      $and: [{ category_id: regex }, { sales: { $gte: 100 } }]
    })

    res.json({
      pageName: foundCategory.category_name,
      currentCategory: foundCategory,
      products: allProducts,
      current: page,
      pages: Math.ceil(count / limit)
    })
  } catch (err) {
    return res
      .status(500)
      .send('There was an error getting all top sold products in this category.')
  }
})

module.exports = router
