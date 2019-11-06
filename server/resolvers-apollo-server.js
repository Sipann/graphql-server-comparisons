export default {

  EventType: {
    eventGroup: async (parent, args, { Group }) => {
      return await Group.findById(parent.eventGroup);
    },
    eventParticipants: async (parent, args, { Participant }) => {
      return await Participant.find({ _id: parent.eventParticipants });
    },
  },

  GroupType: {
    groupEvents: async (parent, args, { Event }) => {
      return await Event.find({ _id: parent.groupEvents });
    },
    groupInvited: async (parent, args, { Invited }) => {
      return await Invited.find({ _id: parent.groupInvited });
    },
    groupParticipants: async (parent, args, { Participant }) => {
      return await Participant.find({ _id: parent.groupParticipants });
    },
  },

  InvitedType: {
    invitedGroups: async (parent, args, { Group }) => {
      return await Group.find({ _id: parent.invitedGroups });
    },
  },

  ParticipantType: {
    participantEvents: async (parent, args, { Event }) => {
      return await Event.find({ _id: parent.participantEvents });
    },
    participantGroups: async (parent, args, { Group }) => {
      return await Group.find({ _id: parent.participantGroups });
    },
  },

  
  Query: {

    event: async (_, { eventId }, { Event }) => {
      return await Event.findById(eventId);
    },

    group: async (_, { groupId }, { Group }) => {
      return await Group.findById(groupId);
    },

    groups: async (_, args, { Group }) => {
      return await Group.find({});
    },
    
    invited: async (_, { email }, { Invited }) => {
      return await Invited.findOne({ email: email });
    },
    
    participant: async (_, { participantId }, { Participant }) => {
      return await Participant.findById(participantId);
    },

  },

  Mutation: {
   
    addGroup: async (_, { groupTitle }, { Group }) => {
      try {
        const groupAlreadyExists = await Group.findOne({ groupTitle: groupTitle });
        if (groupAlreadyExists) throw new Error('Group already exists');
  
        return await new Group({
          groupTitle,
        }).save();

      } catch (e) {
        console.error(e);
      }
    },

    addEventToGroup: async (_, { eventTitle, eventGroup, eventDate, eventLocation }, { Event, Group }) => {
      try {
        let queryIsEventInGroup = { $and: [
          { eventTitle: eventTitle },
          { eventGroup: eventGroup },
        ] };
        const eventIsInGroup = await Event.findOne(queryIsEventInGroup);
        if (eventIsInGroup) throw new Error('Event already exists for this group');

        const newEvent = await new Event({
          eventTitle,
          eventGroup,
          eventDate,
          eventLocation
        }).save();

        await Group.findOneAndUpdate(
          { _id: eventGroup },
          { "$push": { "groupEvents": newEvent } }
        );

        return newEvent;

      } catch (e) {
        console.error(e);
      }
    },

    addParticipant: async (_, { username, email, password, avatar }, { Participant }) => {
      try {
        const participantExists = await Participant.findOne({ email: email });
        if (participantExists) throw new Error('Participant already exists');

        return await Participant({
          username, 
          email,
          password,
          avatar
        }).save();

      } catch (e) {
        console.error(e);
      }
    },

    addInvitedToGroup: async (_, { groupId, invitedEmail }, { Invited, Group }) => {
      try {
        const group = await Group.findById(groupId);
        const invited = await Invited.findOne({ email: invitedEmail });

        // check if has already been invited to join the group
        const isInvitedInGroup = group.groupInvited.includes(invited._id);
        if (isInvitedInGroup) throw new Error('Invited is already part of this group');

        // add group to invited
        invited.invitedGroups.push(groupId);
        await invited.save();

        // add invited to group 
        group.groupInvited.push(invited._id);
        await group.save();

        return invited;

      } catch (e) {
        console.error(e);
      }
    },
    

    addParticipantToEvent: async (_, { eventId, participantId }, { Event, Participant }) => {
      try {
        const event = await Event.findById(eventId);
        const groupOfEvent = event.eventGroup;
        const participant = await Participant.findById(participantId);

        // check if participant is already registered for this event
        const isParticipantOfEvent = participant.participantEvents.includes(event._id);
        if (isParticipantOfEvent) throw new Error('Participant already takes part to this event');


        // check if participant is part of group organizing this event
        const isParticipantMemberOfGroup = participant.participantGroups.includes(groupOfEvent);

        if (!isParticipantMemberOfGroup) throw new Error('Participant is not a member of group organizing this event');

        // add Event to Participant
        participant.participantEvents.push(event);
        await participant.save();

        // add Participant to Event
        event.eventParticipants.push(participant);
        await event.save();

        return participant;

      } catch (e) {
        console.error(e);
      }
    },

    addParticipantToGroup: async (_, { groupId, participantId }, { Group, Invited, Participant }) => {
      try {
        const participant = await Participant.findById(participantId);
        const group = await Group.findById(groupId);
        const invited = await Invited.findOne({ email: participant.email });

        if (!invited) throw new Error('Participant has not been invited to join any group');

        // check if participant is already part of this group
        const participantIsInGroup = group.groupParticipants.includes(participant._id);
        if (participantIsInGroup) throw new Error('Participant is already part of this group');

        // check if participant has been invited to join the group
        const participantIsInvited = group.groupInvited.includes(invited._id);
        if (!participantIsInvited) throw new Error('Participant has not been invited to join this group');

        // add group to participant
        participant.participantGroups.push(groupId);
        await participant.save();
        
        // add participant to group
        group.groupParticipants.push(participantId);
        await group.save();

        return participant;

      } catch (e) {
        console.error(e);
      }
    },

  },
}
