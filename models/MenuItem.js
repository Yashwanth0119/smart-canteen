import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Meals', 'Fast Food', 'Snacks', 'Beverages', 'Desserts']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  prepTime: {
    type: Number,
    default: 10
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  inStockCount: {
    type: Number,
    default: 20
  }
}, {
  timestamps: true
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
