import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  description: String,
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  filePath: {
    type: String,
    required: [true, 'Please provide a file path'],
  },
  fileType: {
    type: String,
    required: [true, 'Please provide a file type'],
  },
  fileSize: {
    type: String,
    required: [true, 'Please provide a file size'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);