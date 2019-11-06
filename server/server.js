import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

import typeDefs from './typeDefs-apollo-server.js';
import resolvers from './resolvers-apollo-server.js';

import Event from './models/Event.js';
import Group from './models/Group.js';
import Invited from './models/Invited.js';
import Participant from './models/Participant.js';

// DB
mongoose.connect(
  process.env.MONGO_URI,
  { 
    useCreateIndex: true,
    useNewUrlParser: true, 
    useFindAndModify: false,
    useUnifiedTopology: true, 
  }
).then(() => console.log('DB connected'))
.catch(err => console.error(err));


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    Event,
    Group,
    Invited,
    Participant
  }
});

const app = express();
server.applyMiddleware({ app });

app.listen(4000, () => { console.log('app listening for requests on port 4000'); });



