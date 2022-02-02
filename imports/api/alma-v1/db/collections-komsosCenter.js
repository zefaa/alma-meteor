import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

export const Sessions = new Mongo.Collection( 'sessions' ,{ idGeneration: 'MONGO' });
export const Categorys = new Mongo.Collection( 'categories' , { idGeneration: 'MONGO'});
export const Parokis = new Mongo.Collection( 'parokis' );