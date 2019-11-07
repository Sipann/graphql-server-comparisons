import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

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


const Date = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if(ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }
    return null;
  }
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
      type: Date,
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
        // return await Participant.find({ participantEvents: parent.id })
        return await Participant.find({ _id: parent.eventParticipants });
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
        // return await Event.find({ eventGroup: parent.id })
        return await Event.find({ _id: parent.groupEvents });
      }
    },

    groupInvited: {
      type: new GraphQLList(InvitedType),
      description: 'Persons (emails) invited to join this group',
      resolve: async (parent) => {
        // return await Invited.find({ invitedGroups: parent.id });
        return await Invited.find({ _id: parent.groupInvited });
      },
    },

    groupParticipants: {
      type: new GraphQLList(ParticipantType),
      description: 'Participants (registered users) of this group',
      resolve: async (parent) => {
        // return await Participant.find({ participantGroups: parent.id });
        return await Participant.find({ _id: parent.groupParticipants });
      },
    },

  }),
});


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
      args: { groupId: { type: GraphQLID } },
      resolve (_, { groupId }) {
        return Group.findById(groupId);
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
      args: { participantId: { type: GraphQLID } },
      resolve (_, { participantId } ) {
        return Participant.findById(participantId);
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
    },

    addInvitedToGroup: {
      type: InvitedType,
      args: {
        groupId: { type: new GraphQLNonNull(GraphQLID) },
        invitedEmail: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { groupId, invitedEmail }) => {
        try {
          const group = await Group.findById(groupId);
          let invited = await Invited.findOne({ email: invitedEmail });
  
          // add group to invited
          if (invited) {
            // check if has already been invited to join the group
            const isInvitedInGroup = group.groupInvited.includes(invited._id);
            if (isInvitedInGroup) throw new Error('Invited is already part of this group');

            invited.invitedGroups.push(groupId);
            await invited.save();
          } else {
            invited = await new Invited({
              email: invitedEmail,
              invitedGroups: [groupId]
            }).save();
          }
  
          // add invited to group 
          group.groupInvited.push(invited._id);
          await group.save();
  
          return invited;
  
        } catch (e) {
          console.error(e);
        }
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
    },

    addParticipantToGroup: {
      type: ParticipantType,
      args: {
        groupId: { type: new GraphQLNonNull(GraphQLID) },
        participantId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve:  async (_, { groupId, participantId }) => {
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

    addParticipantToEvent: {
      type: ParticipantType,
      args: {
        eventId: { type: new GraphQLNonNull(GraphQLID) },
        participantId: { type: new GraphQLNonNull(GraphQLID) }, 
      },
      resolve: async (_, { eventId, participantId }) => {
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

      }
    },


  },
});



export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});