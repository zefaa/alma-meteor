// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CimUjians, CimUjianSheets } from './ujians.js';
import { CoursePrograms, CourseProgramsActive, AcpMaterials } from '../coursePrograms/coursePrograms.js';
import _ from 'underscore';

Meteor.methods({
  'cim.getUjianDetails'(ujianId) {
    check(ujianId, String);

    const meteorId = new Meteor.Collection.ObjectID(ujianId);

    const thisUjian = CimUjians.findOne({
      "_id": meteorId
    });
    if (thisUjian) {
      return thisUjian;
    }
  },
  'cim.getUjianSheetDetails'(sheetId) {
    check(sheetId, String);
    console.log(sheetId)
    const meteorId = new Meteor.Collection.ObjectID(sheetId);
    const thisUjian = CimUjianSheets.findOne({
      "_id": meteorId
    });
    if (thisUjian) {
      return thisUjian;
    }
  },
  'cim.ujianSheets.grade'(sheetId, score) {
    check(sheetId, String);
    check(score, Number);
    console.log(sheetId)
    const meteorId = new Meteor.Collection.ObjectID(sheetId);
    const thisUjianSheet = CimUjianSheets.findOne({
      "_id": meteorId
    });

    console.log(thisUjianSheet)
    console.log('grading now')

    if (thisUjianSheet) {
      console.log(thisUjianSheet)
      // return thisUjianSheet;
      return CimUjianSheets.update({
        _id: meteorId
      }, {
        $set: {
          score
        }
      })

    }
  },
  // 'acpUjianCreate' : async function (body) {
  //   checkAllowAccess(['cimAcpEdit']);
  //   check (body, Object);
  //   const objectIdAcp = new Mongo.Collection.ObjectID(body.acpId);

  //   const acp = CourseProgramsActive.findOne({
  //     _id : objectIdAcp
  //   });
  //   body.acpName = acp.name;

  //   return CimUjians.insert(body, function (error, result) {
  //     if (result) {
  //       const ujians = {
  //         _id : result.toHexString(),
  //         name : body.name,
  //         ujianType : body.ujianType
  //       }

  //       CourseProgramsActive.update({
  //         _id  : objectIdAcp
  //       }, {
  //         $addToSet: {
  //           ujians
  //         }
  //       })
  //     }
  //   })

  // },
  // 'acpUjianDelete' : async function (ujianId, acpId) {
  //   checkAllowAccess(['cimAcpEdit']);
  //   check (ujianId, String);
  //   check (acpId, String);

  //   const objectUjianId = new Mongo.Collection.ObjectID(ujianId);
  //   acpId = new Mongo.Collection.ObjectID(acpId);

  //   return CourseProgramsActive.update({
  //     _id : acpId
  //   },{
  //     $pull : {
  //       ujians : {
  //         _id : ujianId
  //       }
  //     }
  //   }, function(error, result) {
  //     if (result) {
  //       CimUjians.remove({
  //         _id : objectUjianId
  //       })
  //     }
  //   })
  // },
  // 'acpUjianEdit' : async function (body) {
  //   checkAllowAccess(['cimAcpEdit']);
  //   check (body, Object);

  //   const ujianIdString = body.ujianId + '';
  //   const objectIdAcp = new Mongo.Collection.ObjectID(body.acpId);
  //   const acp = CourseProgramsActive.findOne({
  //     _id : objectIdAcp
  //   });
  //   body.acpName = acp.name;


  //   const ujianId = new Mongo.Collection.ObjectID(body.ujianId);
  //   delete body.ujianId
  //   return CimUjians.update({
  //     _id : ujianId
  //   },{
  //     $set : body
  //   }, function(error, result){
  //     if(result) {
  //       const acp = CourseProgramsActive.findOne({
  //         _id : objectIdAcp,
  //       });
  //       const index = _.findIndex(acp.ujians, {
  //         '_id' : ujianIdString
  //       });
  //       const update = acp.ujians;
  //       update[index].name = body.name;
  //       update[index].ujianType  = body.ujianType;
  //       return CourseProgramsActive.update({
  //         _id : objectIdAcp
  //       }, {
  //         $set : {
  //           ujians : acp.ujians
  //         }
  //       })
  //     }
  //   })
  // }
});
