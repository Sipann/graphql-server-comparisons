import Group from './models/Group.js';
import Participant from './models/Participant.js';
import Event from './models/Event.js';
import Invited from './models/Invited.js';
import 'mongoose';

import { 
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType, 
  GraphQLSchema,
  GraphQLString, 
} from 'graphql';


const InvitedType = new GraphQLObjectType({
  name: 'Invited',
  fields: () => ({
    id: { type: GraphQLID },
    email: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Invited person\'s email', 
    },
    invitedGroups: {
      type: new GraphQLList(GroupType),
      description: 'Groups that have invited this "invited/email"',
      resolve: async (parent) => {
        return await Group.find({ _id: parent.invitedGroups });
      },
    },
  }),
});


const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  fields: () => ({
    id: { type: GraphQLID },
    username: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Registered user\'s username',
    },
    email: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Registered user\'s email', 
    },
    password: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Registered user\'s password', 
    },
    avatar: { 
      type: GraphQLString,
      description: 'Registered user\' s avatar', 
    },
   
    participantGroups: {
      type: new GraphQLList(GroupType),
      description: 'Groups this user belongs to',
      resolve: async (parent) => {
        return await Group.find({ _id: parent.participantGroups });
      }
    },
    participantEvents: {
      description: 'Events this user takes part of',
      type: new GraphQLList(EventType),
      resolve: async (parent) => {
        return await Event.find({ _id: parent.participantEvents });
      }
    },
  }),
});

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: 'Event organized',
  fields: () => ({
    id: { type: GraphQLID },
    eventTitle: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the event', 
    },
    eventDate: { 
      type: GraphQLString,
      description: 'Date of the event' 
    },
    eventLocation: { 
      type: GraphQLString,
      description: 'Location of the event' 
    },

    eventGroup: {
      type: new GraphQLNonNull(GroupType),
      description: 'Group organizing this event',
      resolve: async (parent) => {
        return await Group.findById(parent.eventGroup);
      }
    },
    eventParticipants: {
      description: 'Participants (registered users) going to this event',
      type: new GraphQLList(ParticipantType),
      resolve: async (parent) => {
        return await Participant.find({ participantEvents: parent.id })
      } 
    }
  }),
});

const GroupType = new GraphQLObjectType({
  name: 'Group',
  description: 'Group of persons',
  fields: () => ({
    id: { type: GraphQLID },

    groupTitle: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the group', 
    },

    groupEvents: {
      type: new GraphQLList(EventType),
      description: 'Events organized by this group',
      resolve: async (parent) => {
        return await Event.find({ eventGroup: parent.id })
      }
    },
    groupParticipants: {
      type: new GraphQLList(ParticipantType),
      description: 'Participants (registered users) of this group',
      resolve: async (parent) => {
        return await Participant.find({ participantGroups: parent.id });
      },
    },

    groupInvited: {
      type: new GraphQLList(InvitedType),
      description: 'Persons (emails) invited to join this group',
      resolve: async (parent) => {
        return await Invited.find({ invitedGroups: parent.id });
      },
    },
    
  }),
});



const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {

    event: {
      type: EventType,
      description: 'fetch an event by its id',
      args: { eventId: { type: GraphQLID } },
      resolve (_, { eventId }) {
        return Event.findById(eventId);
      },
    },
    
    group: {
      type: GroupType,
      description: 'fetch a group by its id',
      args: { id: { type: GraphQLID } },
      resolve (_, { id }) {
        return Group.findById(id);
      },
    },

    groups: {
      type: new GraphQLList(GroupType),
      description: 'fetch all groups',
      resolve() {
        return Group.find({});
      },
    },

    invited: {
      type: InvitedType,
      description: 'fetch an invited person by its email',
      args: { email: { type: GraphQLString } },
      resolve (_, { email }) {
        return Invited.findOne( { email: email });
      },
    },

    participant: {
      type: ParticipantType,
      description: 'fetch a participant (registered user) by its id',
      args: { id: { type: GraphQLID } },
      resolve (_, { id } ) {
        return Participant.findById(id);
      },
    },

  }
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {

    addGroup: {
      type: GroupType,
      args: {
        groupTitle: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { groupTitle }) => {
        const group = await Group.findOne({ groupTitle: groupTitle });
        if (group) throw new Error('Group already exists');
        const newGroup = await new Group({
          groupTitle,
        }).save();
        return newGroup;
      },
    },


    addEventToGroup: {
      type: EventType,
      args: {
        eventTitle: { type: new GraphQLNonNull(GraphQLString) },
        eventGroup: { type: new GraphQLNonNull(GraphQLID) },
        eventDate: { type: GraphQLString },
        eventLocation: { type: GraphQLString },
      },
      resolve: async (_, { eventTitle, eventGroup, eventDate, eventLocation }) => {
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
        return newEvent;
      },
    },

    addInvitedToGroup: {
      type: InvitedType,
      args: {
        groupId: { type: new GraphQLNonNull(GraphQLID) },
        invitedEmail: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { groupId, invitedEmail }) => {
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
        return invited;
      },
    },

    addParticipant: {
      type: ParticipantType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        avatar: { type: GraphQLString },
      },
      resolve: async (_, {username, email, password, avatar}) => {
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
    },

    addParticipantToGroup: {
      type: ParticipantType,
      args: {
        groupId: { type: new GraphQLNonNull(GraphQLID) },
        participantId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve:  async (_, { groupId, participantId }) => {
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
        return newParticipantToGroup;
      },
    },

    addParticipantToEvent: {
      type: ParticipantType,
      args: {
        eventId: { type: new GraphQLNonNull(GraphQLID) },
        participantId: { type: new GraphQLNonNull(GraphQLID) }, 
      },
      resolve: async (_, { eventId, participantId }) => {
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
          return newParticipantToEvent;
        }

      }
    },


  },
});



export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});