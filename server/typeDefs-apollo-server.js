import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type InvitedType {
    id: ID
    email: String! 
    invitedGroups: [GroupType]
  }

  type ParticipantType {
    id: ID
    username: String! 
    email: String! 
    password: String!
    avatar: String
    participantGroups: [GroupType]
    participantEvents: [EventType]
  }

  type EventType {
    id: ID
    eventTitle: String!
    eventDate: String
    eventLocation: String
    eventGroup: GroupType
    eventParticipants: [ParticipantType]
  }

  type GroupType {
    id: ID
    groupTitle: String!
    groupEvents: [EventType]
    groupParticipants: [ParticipantType]
    groupInvited: [InvitedType]
  }

  type Query {
    event(eventId: ID!): EventType
    group(groupId: ID): GroupType
    groups: [GroupType]
    invited(email: String!): InvitedType
    participant(participantId: ID!): ParticipantType
  }

  type Mutation {
    addGroup(groupTitle: String!): GroupType
    addEventToGroup(eventTitle: String!, eventGroup: ID!, eventDate: String, eventLocation: String): EventType
    addInvitedToGroup(groupId: ID!, invitedEmail: String!): InvitedType
    addParticipant(username: String!, email: String!, password: String!, avatar: String): ParticipantType
    addParticipantToGroup(groupId: ID!, participantId: ID!): ParticipantType
    addParticipantToEvent(eventId: ID!, participantId: ID!): ParticipantType
  }
`;

export default typeDefs;