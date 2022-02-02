import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const Profiles = new Mongo.Collection('appProfiles', { idGeneration: 'MONGO' });
export const AppUsers = new Mongo.Collection('appUsers', { idGeneration: 'MONGO' });



