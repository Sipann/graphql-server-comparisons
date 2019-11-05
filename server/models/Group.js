import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  
  groupTitle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  groupEvents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Event',
  },
  
  groupParticipants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Participant',
  },

  groupInvited: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Invited'
  }

});

export default mongoose.model('Group', GroupSchema);
