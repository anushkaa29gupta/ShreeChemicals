const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch { res.status(500).json({ message: "Server error" }); }
};

const addProduct = async (req, res) => {
  try {
    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];
    let body = { ...req.body, images };

    // Tea: parse weightOptions
    if (req.body.weightOptions) {
      try { body.weightOptions = JSON.parse(req.body.weightOptions); }
      catch { body.weightOptions = []; }
    }

    // Candles: parse sizeOptions
    if (req.body.sizeOptions) {
      try { body.sizeOptions = JSON.parse(req.body.sizeOptions); }
      catch { body.sizeOptions = []; }
    }

    // Clear candle-specific fields for non-candle products
    if (body.category !== "Candles") {
      body.candleCategory = "";
      body.fragrance      = "";
      body.sizeOptions    = [];
    }

    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    let keptImages = [];
    if (req.body.keptImages) {
      try { keptImages = JSON.parse(req.body.keptImages); }
      catch { keptImages = []; }
    }

    const newImages   = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const finalImages = [...keptImages, ...newImages].slice(0, 5);

    let body = { ...req.body, images: finalImages };
    delete body.keptImages;

    // Tea: parse weightOptions
    if (req.body.weightOptions) {
      try { body.weightOptions = JSON.parse(req.body.weightOptions); }
      catch { body.weightOptions = []; }
    }

    // Candles: parse sizeOptions
    if (req.body.sizeOptions) {
      try { body.sizeOptions = JSON.parse(req.body.sizeOptions); }
      catch { body.sizeOptions = []; }
    }

    // Clear candle-specific fields for non-candle products
    if (body.category !== "Candles") {
      body.candleCategory = "";
      body.fragrance      = "";
      body.sizeOptions    = [];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, { $set: body }, { new: true, strict: false }
    );
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted." });
  } catch { res.status(500).json({ message: "Server error" }); }
};

module.exports = { getAllProducts, addProduct, updateProduct, deleteProduct };