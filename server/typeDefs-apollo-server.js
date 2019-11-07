import { gql } from 'apollo-server-express';

const typeDefs = gql`

  scalar Date

  type InvitedType {
    """
    Invited person to a group. May already be a registered user (Participant) or not.
    """
    id: ID
    email: String! 
    invitedGroups: [GroupType]
  }

  type ParticipantType {
    """
    Registered user.
    """
    id: ID
    username: String! 
    email: String! 
    password: String!
    avatar: String
    participantGroups: [GroupType]
    participantEvents: [EventType]
  }

  type EventType {
    """
    Description of an event organized by a group.
    """
    id: ID
    eventTitle: String!
    eventDate: Date
    eventLocation: String
    eventGroup: GroupType
    eventParticipants: [ParticipantType]
  }

  type GroupType {
    """
    Description of a group.
    
    """
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