import mongoose from 'mongoose';

const InvitedSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  invitedGroups: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Group'
  },

});

export default mongoose.model('Invited', InvitedSchema);