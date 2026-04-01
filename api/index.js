const express = require('express');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors');
const axios = require("axios");
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  useremail: String,
  password: String,
  gender:String,
  phone:String,
  aphone:String,
  address:String,
});

const productSchema = new mongoose.Schema({
  name: String,
  url: String,
  public_id: String,
  desc: String,
  cos: Number,
  dis: Number,
  nop: Number,
  mob: Number
});

const tdataSchema =new mongoose.Schema({
  uid:String,
  url:String,
  desc:String,
  cos:Number,
  dis:Number
})
const Users = mongoose.model("usernames", userSchema);
const Products = mongoose.model("products", productSchema);
const tdata=mongoose.model("tdatas",tdataSchema);
const multer = require('multer');
const path = require('path');
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

const app = express();
const port = process.env.PORT || 3500;

app.use(cors({ origin: true, credentials: true }));
app.options('/{*path}', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGODB_URI) {
        console.error("DB Error: MONGODB_URI missing in ENV");
        throw new Error("MONGODB_URI missing in ENV");
    }
    try { 
        await mongoose.connect(process.env.MONGODB_URI); 
    } catch (err) { 
        console.error("DB Connect Error:", err.message);
        throw err; 
    }
};

// DO NOT call connectDB() at the top level to prevent Vercel boot crashes
app.get('/api/health', (req, res) => res.json({ status: "UP", db: mongoose.connection.readyState }));
app.get('/api/', (req, res) => res.send("API Live"));

app.post('/api/', async (req,res)=>{
    const {name,password}=req.body;
    try { await connectDB(); const d = await Users.findOne({useremail:name, password:password}); res.json({ message: !!d, id: d ? d._id : 0}); }
    catch(err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/newreg', async (req, res) => {
  let { name, email, t1, gender, phone, aphone, address } = req.body;
  try {
    if (!name || !email) return res.status(400).json({ message: false, error: "Name and Email are required" });
    
    if (typeof address === 'object' && address !== null) {
        address = Object.values(address).filter(x => x).join(', ');
    }
    
    await connectDB();
    const existingUser = await Users.findOne({ useremail: email });
    if (existingUser) return res.json({ message: false, error: "Email already registered" });
    
    await Users.create({ username: name, useremail: email, password: t1, gender, phone, aphone, address });
    res.json({ message: true });
  } catch (err) { 
    console.error("Reg Error:", err);
    res.status(400).json({ message: "Server Registration Error", error: err.message }); 
  }
});

app.get('/api/product', async (req,res)=>{
    try { await connectDB(); const d = await Products.find(); res.json(d); }
    catch(err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/perinf', async (req,res)=>{
    try { await connectDB(); const d = await Users.findById(req.body); res.json(d); }
    catch(err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/product', async (req,res)=>{
    try { await connectDB(); const d = await Products.find({desc: { $regex: req.body, $options: 'i' }}); res.json(d); }
    catch(err) { res.status(400).json({ error: err.message }); }
});

app.post("/api/Card", async (req, res) => {
  try { await connectDB(); const d = await tdata.find({ uid: req.body.id }); res.json(d); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.post("/api/Cardre", async (req,res) =>{
    try { await connectDB(); await tdata.deleteOne({ _id: req.body.id }); res.json({ message: true }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/product/:id', async (req,res)=>{
    try { await connectDB(); const d = await Products.findById(req.params.id); res.json(d); }
    catch(err) { res.status(400).json({ error: err.message }); }
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
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post("/api/itdata", async (req,res)=>{
    try { await connectDB(); await tdata.create({uid:req.body.id, ...req.body}); res.json({ message: true }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.post("/api/create-order", async (req, res) => {
  try {
    const o = await new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }).orders.create({
      amount: req.body.amount * 100, currency: "INR", receipt: "r_" + Date.now()
    });
    res.json(o);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const h = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
  res.json({ success: h === razorpay_signature });
});

// Password change route
app.post('/api/passch', async (req, res) => {
  const { name, newpassword } = req.body;
  try {
    await connectDB();
    const user = await Users.findOne({ useremail: name });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newpassword;
    await user.save();
    res.json({ message: true, htiResults: 'Password updated' });
  } catch (err) {
    console.error('Passch Error:', err);
    res.status(400).json({ error: err.message, htiResults: null });
  }
});

// Vercel route diagnostics
app.use('/{*path}', (req, res) => {
    res.status(404).json({ error: "Route not found in Express", url: req.url, originalUrl: req.originalUrl });
});

module.exports = app;
