import express from 'express';
// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import graphqlHTTP from 'express-graphql';

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

// const Group = require('./models/Group');
// const Participant = require('./models/Participant');


import schema from './schema-graphqlschema.js';


let app = express();

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

// GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));


app.listen(4000, () => { console.log('app listening for requests on port 4000'); });
