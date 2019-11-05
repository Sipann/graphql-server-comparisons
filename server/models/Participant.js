import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
  },
  participantGroups: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Group'
  },
  participantEvents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Event',
  },

});

export default mongoose.model('Participant', ParticipantSchema);