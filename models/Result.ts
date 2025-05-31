import mongoose from 'mongoose';

const ResultItemSchema = new mongoose.Schema({
  position: {
    type: String,
    required: [true, 'Please provide a position'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
}, {
  timestamps: true,
});

const ResultSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  date: {
    type: String,
    required: [true, 'Please provide a date'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  imagePath: String,
  items: [ResultItemSchema],
}, {
  timestamps: true,
});

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);