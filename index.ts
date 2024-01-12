
import MerchantModel from './models/merchantModel';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';

const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydb', {
  // useNewUrlParser: true,
  //useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Authentication and Authorization middleware (you may need to implement your own logic)
const authenticate = (req: any, res: any, next: any) => {
  // Your authentication logic here
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes
app.post('/auth/login', (req, res) => {
  // Implement login logic
  // Set session information
  req.session.user = { /* user details */ };
  res.json({ message: 'Login successful' });
});

app.post('/auth/logout', authenticate, (req, res) => {
  // Implement logout logic
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

app.get('/auth/session', authenticate, (req, res) => {
  // Return session information
  res.json({ user: req.session.user });
});

// Merchant API

// List Merchants
app.get('/api/merchants', authenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, searchQuery, dateFrom, dateTo } = req.query;

    const query: any = {};
    if (searchQuery) {
      // Add your search query logic here
      query.$or = [
        { storeID: new RegExp(searchQuery, 'i') },
        { merchantName: new RegExp(searchQuery, 'i') },
        { email: new RegExp(searchQuery, 'i') },
      ];
    }

    if (dateFrom && dateTo) {
      // Add your date range query logic here
      query.createdAt = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
    }

    const merchants = await MerchantModel.find(query)
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    res.json({ merchants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add Merchant
app.post('/api/merchants', authenticate, async (req, res) => {
  try {
    const { storeID, merchantName, email, commission } = req.body;

    const newMerchant = new MerchantModel({
      storeID,
      merchantName,
      email,
      commission,
    });

    await newMerchant.save();

    res.json({ message: 'Merchant added successfully', merchant: newMerchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Merchant
app.put('/api/merchants/:merchantId', authenticate, async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { merchantName, email, commission } = req.body;

    const updatedMerchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { merchantName, email, commission },
      { new: true }
    );

    res.json({ message: 'Merchant updated successfully', merchant: updatedMerchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Merchant
app.delete('/api/merchants/:merchantId', authenticate, async (req, res) => {
  try {
    const { merchantId } = req.params;

    await MerchantModel.findByIdAndDelete(merchantId);

    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Merchant Details
app.get('/api/merchants/:merchantId', authenticate, async (req, res) => {
  try {
    const { merchantId } = req.params;

    const merchant = await MerchantModel.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    res.json({ merchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Filter Merchants
app.get('/api/merchants/filter', authenticate, async (req, res) => {
  try {
    const { filterOptions } = req.query;

    

    const filteredMerchants = await MerchantModel.find();

    res.json({ merchants: filteredMerchants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
