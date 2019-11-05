import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'express-graphql';

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

const filePath = path.join(__dirname, 'typeDefs-graphql-sdl.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
const schema = buildSchema(typeDefs);
import resolvers from './resolvers-graphql-sdl.js';

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
  rootValue: resolvers,
  graphiql: true
}));

app.listen(4000, () => { console.log('app listening for requests on port 4000'); });
