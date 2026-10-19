import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'worker'],
    default: 'student'
  },
  balance: {
    type: Number,
    default: 0
  },
  department: {
    type: String,
    default: 'General'
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Pre-save hook: Hash password with bcrypt before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify password using bcrypt
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  // If stored password is a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  // Fallback for plain-text comparison
  return this.password === candidatePassword;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
