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
    if (req.body.weightOptions) {
      try { body.weightOptions = JSON.parse(req.body.weightOptions); }
      catch { body.weightOptions = []; }
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
    // Frontend sends which existing images to KEEP (in order)
    let keptImages = [];
    if (req.body.keptImages) {
      try { keptImages = JSON.parse(req.body.keptImages); }
      catch { keptImages = []; }
    }

    // New uploaded images
    const newImages = req.files?.map(f => `/uploads/${f.filename}`) || [];

    // Final image list = kept old ones + new ones, max 5
    const finalImages = [...keptImages, ...newImages].slice(0, 5);

    let body = { ...req.body, images: finalImages };
    delete body.keptImages; // clean up

    if (req.body.weightOptions) {
      try { body.weightOptions = JSON.parse(req.body.weightOptions); }
      catch { body.weightOptions = []; }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, body, { new: true }
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