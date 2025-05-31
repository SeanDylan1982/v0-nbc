import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  date: {
    type: String,
    required: [true, 'Please provide a date'],
  },
  format: {
    type: String,
    required: [true, 'Please provide a format'],
  },
  entryDeadline: {
    type: String,
    required: [true, 'Please provide an entry deadline'],
  },
  description: String,
  status: {
    type: String,
    enum: ['Upcoming', 'In Progress', 'Completed'],
    required: [true, 'Please provide a status'],
  },
  winner: String,
  imagePath: String,
}, {
  timestamps: true,
});

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);