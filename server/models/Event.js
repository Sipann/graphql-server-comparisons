import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  eventTitle: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
  },
  eventLocation: {
    type: String,
    trim: true,
  },
  eventGroup: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  eventParticipants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Participant',
  },

});

export default mongoose.model('Event', EventSchema);