import mongoose from 'mongoose';

const GalleryImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  alt: {
    type: String,
    required: [true, 'Please provide alt text'],
  },
  description: String,
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  storagePath: {
    type: String,
    required: [true, 'Please provide a storage path'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.GalleryImage || mongoose.model('GalleryImage', GalleryImageSchema);