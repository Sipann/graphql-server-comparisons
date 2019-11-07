import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import graphqlHTTP from 'express-graphql';

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

const filePath = path.join(__dirname, 'typeDefs-graphql-sdl.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
import resolvers from './resolvers-graphql-sdl.js';
const schema = makeExecutableSchema({ typeDefs, resolvers });

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
app.use(
  '/graphql', 
  graphqlHTTP({
  schema,
  graphiql: true
}));



app.listen(4000, () => { console.log('app listening for requests on port 4000'); });
