import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'defaultValue']);


export const profileStatusOptions = [
  {
    value: 0,
    label: "awam"
  },
  {
    value: 10,
    label: "frater"
  },
  {
    value: 20,
    label: "diakonat"
  },
  {
    value: 30,
    label: "presbiter"
  },
  {
    value: 80,
    label: "episkopal"
  },
]

export const TempData = new Mongo.Collection('tempData');
export const AppProfiles = new Mongo.Collection('appProfiles', { idGeneration: 'MONGO' });
export const AppUsers = new Mongo.Collection('appUsers');
export const Profiles = new Mongo.Collection( 'profiles' );
export const RolesTemp = new Mongo.Collection( 'rolesTemp' );
export const RolesParent = new Mongo.Collection( 'rolesParent' );

ProfilesSchema = new SimpleSchema({
  "userId": {
    type: String,
    label: "user id related",
  },
  "fullname": {
    type: String,
    label: "nama lengkap",
    optional: true
  },
  "dob": {
    type: Date,
    label: "Tanggal lahir",
    optional: true
  },
  "pob": {
    type: String,
    label: "Tempat lahir",
    optional: true
  },
  "email": {
    type: String,
    label: "email",
    optional: true,
  },
  "phones": {
    type: Array,
    label: "phones",
    optional: true,
  },
    "phones.$": {
      type: Object,
      label: "phones",
      optional: true,
    },
    "phones.$.name": {
      type: String,
      label: "nama",
      optional: true,
    },
    "phones.$.note": {
      type: String,
      label: "keterangan",
      optional: true,
    },
    "phones.$.number": {
      type: Number,
      label: "nomor",
      optional: true,
    },
  "status": {
    type: Number,
    label: "status",
    defaultValue: 10,
    autoform: {
      options: profileStatusOptions
    }
  }
});

Profiles.attachSchema( ProfilesSchema );
