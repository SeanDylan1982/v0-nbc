import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  date: {
    type: String,
    required: [true, 'Please provide a date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide a time'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  description: String,
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  imagePath: String,
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);