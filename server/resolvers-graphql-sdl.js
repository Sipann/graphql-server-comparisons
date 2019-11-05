import Event from './models/Event.js';
import Group from './models/Group.js';
import Participant from './models/Participant.js';
import Invited from './models/Invited.js';
import mongoose from 'mongoose';

export default {

  event: async ({ eventId }) => {
    const event = await Event.findById(eventId)
      .populate({
        path: 'eventGroup',
        model: 'Group'
      })
      .populate({
        path: 'eventParticipants',
        model: 'Participant'
      });
    return event;
  },

  group: async ({ id }) => {
    const group = await Group.findById(id)
      .populate({
        path: 'groupEvents',
        model: 'Event'
      })
      .populate({
        path: 'groupParticipants',
        model: 'Participant'
      })
      .populate({
        path: 'groupInvited',
        model: 'Invited'
      });
    return group;
  },

  groups: async () => {
    const result = await Group.find({})
      .populate({
        path: 'groupEvents',
        model: 'Event'
      });
    return result;
  },
  
  invited: async ({ email }) => {
    const invited = await Invited.findOne({ email: email })
      .populate({
        path: 'invitedGroups',
        model: 'Group'
      });
    return invited;
  },
  
  participant: async ({ id }) => {
    const participant = await Participant.findById(id)
      .populate({
        path: 'participantGroups',
        model: 'Group'
      })
      .populate({
        path: 'participantEvents',
        model: 'Event'
      });
    return participant;
  },



  addGroup: async ({ groupTitle }) => {
    const group = await Group.findOne({ groupTitle: groupTitle });
    if (group) throw new Error('Group already exists');
    const newGroup = await new Group({
      groupTitle,
    }).save();
    return newGroup;
  },
  
  addEventToGroup: async ({ eventTitle, eventGroup, eventDate, eventLocation }) => {
    let query = { $and: [
      { eventTitle: eventTitle },
      { eventGroup: eventGroup },
    ] };
    const event = await Event.findOne(query);
    if (event) throw new Error('Event already exists for this group');

    const newEvent = await new Event({
      eventTitle,
      eventGroup,
      eventDate,
      eventLocation,
    }).save();
    
    await Group.findOneAndUpdate(
      { _id: eventGroup },
      { "$push": { "groupEvents": newEvent._id } }
    );

    return newEvent;
  },
  
  addInvitedToGroup: async ({ groupId, invitedEmail }) => {
    let queryInvitedToThisGroup = { $and: [
      { invitedGroups: groupId }, 
      { email: invitedEmail },
    ]};
    const alreadyInvitedToGroup = await Invited.findOne(queryInvitedToThisGroup);
    if (alreadyInvitedToGroup) throw new Error('Has already been invited to this group');

    const invited = await Invited.findOneAndUpdate(
      { email: invitedEmail },
      { "$push": { "invitedGroups": groupId } },
      { upsert: true, new: true }
    );

    await Group.findOneAndUpdate(
      { _id: groupId },
      { "$push": { "groupInvited": invited._id } }
    );

    return invited;
  },
  
  addParticipant: async ({username, email, password, avatar}) => {
    const participant = await Participant.findOne({ email: email });
    if (participant) throw new Error('Participant already exists');
    const newParticipant = await Participant({
      username,
      email,
      password,
      avatar
    }).save();
    return newParticipant;
  },
  
  addParticipantToGroup: async ({ groupId, participantId }) => {
    let query = { $and: [
      { _id: participantId },
      { participantGroups: groupId },
    ] };
    const participant = await Participant.findOne(query);
    if (participant) throw new Error('Participant already part of this group');

    const newParticipantToGroup = await Participant.findOneAndUpdate(
      { _id: participantId },
      { "$push": { "participantGroups": groupId } },
      { upsert: true, new: true }
    );

    await Group.findOneAndUpdate(
      { _id: groupId },
      { "$push": { "groupParticipants": newParticipantToGroup._id } }
    );

    return newParticipantToGroup;
  },
  
  addParticipantToEvent: async ({ eventId, participantId }) => {
    let queryParticipantInEvent = { $and: [
      { _id: participantId },
      { participantEvents: eventId },
    ] };
    const participantInEvent = await Participant.findOne(queryParticipantInEvent);
    if (participantInEvent) throw new Error('Participant already registered for this event');

    const event = await Event.findById(eventId, 'eventGroup');
    const eventGroupId = event.eventGroup;

    let queryParticipantInGroupOfEvent = { $and: [
      { _id: participantId },
      { participantGroups: eventGroupId },
    ] };
    const participantInGroupOfEvent = await Participant.findOne(queryParticipantInGroupOfEvent);
    if (!participantInGroupOfEvent) throw new Error('Participant is not a member of group organizing this event');
    else {
      const newParticipantToEvent = await Participant.findOneAndUpdate(
        { _id: participantId },
        { "$push": { "participantEvents" : eventId } },
        { upsert: true, new: true }
      );

      await Event.findOneAndUpdate(
        { _id: eventId },
        { "$push": { "eventParticipants": newParticipantToEvent._id } }
      );

      return newParticipantToEvent;
    }

  },

}

