import {
    Meteor
} from 'meteor/meteor';
import {
    Roles
} from 'meteor/alanning:roles';

import moment from 'moment';
import _ from 'underscore';

import { PeriodeStudis } from '/imports/api/alma-v1/db/collections.js';
import { CimUjians, CimUjianSheets } from '/imports/api/ujians/ujians.js';

Meteor.publish("cim.ujians.list", function(psId) {
  check(psId, String);
  const results = CimUjians.find({
    "psId": psId
  }, {
    sort: {
      date: -1
    }
  });
});

Meteor.publish("cim.ujianSheets.list", function(ujianId) {
  check(ujianId, String);
  const results = CimUjianSheets.find({
    "ujianId": ujianId
  }, {
    sort: {
      acpId: 1
    }
  });

  return results;
});





