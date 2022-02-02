import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const CimUjians = new Mongo.Collection('cimUjians', { idGeneration: 'MONGO' });
export const CimUjianSheets = new Mongo.Collection('cimUjianSheets', { idGeneration: 'MONGO' });



