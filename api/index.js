const express = require('express');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors');
const axios = require("axios");
const mongoose = require('mongoose');
const { Users, Products, tdata } = require('./mongodb.js');
const multer = require('multer');
const path = require('path');
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

const app = express();
const port = process.env.PORT || 3500;

app.use(cors({ origin: true, credentials: true }));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try { await mongoose.connect(process.env.MONGODB_URI); }
    catch (err) { console.error("DB Error:", err.message); }
};
connectDB();

app.get('/api/health', (req, res) => res.json({ status: "UP", db: mongoose.connection.readyState }));
app.get('/api/', (req, res) => res.send("API Live"));

app.post('/api/', async (req,res)=>{
    const {name,password}=req.body;
    try { await connectDB(); const d = await Users.findOne({useremail:name, password:password}); res.json({ message: !!d, id: d ? d._id : 0}); }
    catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/newreg', async (req, res) => {
  let { name, email, t1, gender, phone, aphone, address } = req.body;
  try {
    if (typeof address === 'object' && address !== null) {
        address = Object.values(address).filter(x => x).join(', ');
    }
    if (!name || !email) return res.json({ message: false, error: "Missing fields" });
    await connectDB();
    const existingUser = await Users.findOne({ useremail: email });
    if (existingUser) return res.json({ message: false, error: "User exists" });
    await Users.create({ username: name, useremail: email, password: t1, gender, phone, aphone, address });
    res.json({ message: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/product', async (req,res)=>{
    try { await connectDB(); const d = await Products.find(); res.json(d); }
    catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/perinf', async (req,res)=>{
    try { await connectDB(); const d = await Users.findById(req.body); res.json(d); }
    catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/product', async (req,res)=>{
    try { await connectDB(); const d = await Products.find({desc: { $regex: req.body, $options: 'i' }}); res.json(d); }
    catch(err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/Card", async (req, res) => {
  try { await connectDB(); const d = await tdata.find({ uid: req.body.id }); res.json(d); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/Cardre", async (req,res) =>{
    try { await connectDB(); await tdata.deleteOne({ _id: req.body.id }); res.json({ message: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/product/:id', async (req,res)=>{
    try { await connectDB(); const d = await Products.findById(req.params.id); res.json(d); }
    catch(err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/Sell", upload.single("img"), async (req, res) => {
  try {
    await connectDB();
    const result = await new Promise((resolve, reject) => {
      const s = cloudinary.uploader.upload_stream({ folder: "uploads" }, (e, r) => r ? resolve(r) : reject(e));
      s.end(req.file.buffer);
    });
    const p = new Products({ name: result.original_filename, url: result.secure_url, public_id: result.public_id, ...req.body });
    await p.save();
    res.json({ message: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/itdata", async (req,res)=>{
    try { await connectDB(); await tdata.create({uid:req.body.id, ...req.body}); res.json({ message: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/create-order", async (req, res) => {
  try {
    const o = await new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }).orders.create({
      amount: req.body.amount * 100, currency: "INR", receipt: "r_" + Date.now()
    });
    res.json(o);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const h = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
  res.json({ success: h === razorpay_signature });
});

module.exports = app;
