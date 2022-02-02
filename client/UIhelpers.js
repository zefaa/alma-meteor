import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import { PeriodeStudis } from '../imports/api/alma-v1/db/collections.js';
import { Tingkats } from '../imports/api/alma-v1/db/collections.js';

import { ItemAnswers } from '../imports/api/alma-v1/db/collections-assessment.js';
import { ujianTypeOptions } from '../imports/api/alma-v1/db/collections-siakad.js';
import { TugasAkhirs } from '../imports/api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../imports/api/alma-v1/db/collections-siakad.js';
import { MataKuliahs } from '../imports/api/alma-v1/db/collections-siakad.js';
import { scoringOptions } from '../imports/api/alma-v1/db/collections-siakad.js';
import { hariKuliahs } from '../imports/api/alma-v1/db/collections-siakad.js';

import { bakulFiles } from '../imports/api/alma-v1/db/collections-files.js';
import { taImages } from '../imports/api/alma-v1/db/collections-files.js';
import { profilePics } from '../imports/api/alma-v1/db/collections-files.js';
import { rpsUploads } from '../imports/api/alma-v1/db/collections-files.js';
import { ujianFiles } from '../imports/api/alma-v1/db/collections-files.js';

import { saDict } from '../imports/api/alma-v1/db/dict-assessment.js';
import { sagDict } from '../imports/api/alma-v1/db/dict-assessment.js';
import { fbDict } from '../imports/api/alma-v1/db/dict-assessment.js';
import { templateDict } from '../imports/api/alma-v1/db/dict-assessment.js';

import { Books } from '../imports/api/alma-v1/db/collections-libraria.js';

import { CimUjians } from '/imports/api/ujians/ujians.js';


Template.registerHelper('getTemplateName', function (value) {
  let templateId = parseInt(value);
  if ( value ){
    let thisTemplate = _.findWhere(templateDict, {"id": templateId });
    if (thisTemplate !== undefined) {
      return thisTemplate.label;
    }
  } else {
    return "Unrecognized template. Please report this to Admin."
  }
});


Template.registerHelper('getUjianType', function (value) {
  let ujianType = parseInt(value);
  if ( value !== undefined ){
    let thisUjian = _.findWhere(ujianTypeOptions, {"value": ujianType });

    if (thisUjian !== undefined) {
      return thisUjian.label;
    }
  } else {
    return ""
  }
});



Template.registerHelper('getScoringScheme', function (value) {
  let qId = parseInt(value);
  if ( value ){
    let thisQ = _.findWhere(scoringOptions, {"value": qId });

    if (thisQ !== undefined) {
      return thisQ.label;
    } else {
      return "kok aneh?";
    }
  } else {
    return "Unrecognized scoring scheme. Please report this to Admin."
  }
});

Template.registerHelper('getQuestion', function (value) {
  let qId = parseInt(value);
  if ( value ){
    let thisQ = _.findWhere(saDict, {"id": qId });

    if (thisQ !== undefined) {
      return thisQ.question;
    }
  } else {
    return "Unrecognized question. Please report this to Admin."
  }
});

Template.registerHelper('getGroupName', function (value) {
  let gId = parseInt(value);
  if ( value ){
    let thisG = _.findWhere(sagDict, {"id": gId });

    if (thisG !== undefined) {
      return thisG.label;
    }
  } else {
    return "Unrecognized group. Please report this to Admin."
  }
});


Template.registerHelper('getFbLabel', function (value) {
  let fbId = parseInt(value);
  if ( value ){
    let thisFb = _.findWhere(fbDict, { "id": fbId });
    if (thisFb !== undefined) {
      return thisFb.label;
    }
  } else {
    return "Unrecognized group. Please report this to Admin."
  }
});



Template.registerHelper('formatDec2', function(context) {
  if ( context !== undefined ) {
    let num = context.toFixed(2);
    return num;
  }
});


Template.registerHelper('formatStanding', function(context) {
  if ( context !== undefined ) {
    let num = context.toFixed(2);
    if ( num < 0 ) {
      return '<span class="standing minus">' + num + ' %</span>';
    } else if ( num == 0 ) {
      return '<span class="standing"> 0 </span>';
    } else {
      return '<span class="standing plus">' + num + ' %</span>';
    }
  }
});

Template.registerHelper('formatRp', function(context, options) {
  if(context)
    return 'Rp ' + numeral(context).format('0,0');
});

Template.registerHelper('formatQty', function(context, options) {
  if(context)
    return numeral(context).format('0,0');
});

Template.registerHelper('formatHRDate', function(context, options) {
  if(context)
    return moment(context).format("D MMM YYYY");
});

Template.registerHelper('formatHtmlDate', function(context, options) {
  if(context)
    return moment(context).format("YYYY-MM-DD");
});

Template.registerHelper('formatHtmlDateTime', function(context, options) {
  if(context)
    return moment(context).format("YYYY-MM-DD HH:mm");
});

Template.registerHelper('formatHRDT', function(context, options) {
  if(context)
    return moment(context).format("D MMM YYYY - HH:mm");
});

Template.registerHelper('formatDTShort', function(context, options) {
  if(context)
    return moment(context).format("D/MM/YY hh:mm");
});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});

Template.registerHelper('greaterThan', function (a, b) {
  return a > b;
});

Template.registerHelper('lessThan', function (a, b) {
  return a < b;
});

Template.registerHelper('notEqual', function (a, b) {
  return a != b;
});

Template.registerHelper('toInt', function (a) {
  return parseInt(a);
});


Template.registerHelper('abolishNull', function (value) {
  if ( value === "null" ) {
    return "Rekomendasi Formator";
  } else {
    return value;
  }
});



Template.registerHelper('preventUndefined', function (value) {
  if ( value == undefined ) {
    return "";
  } else {
    return value;
  }
});



Template.registerHelper('arrayify',function(obj){
    var result = [];
    // for (var key in obj) result.push({name:key,value:obj[key]});
    _.each(obj, function(e, k){
      result.push({
        "title": k,
        "items": e
      });
    });
    return result;
});

Template.registerHelper('arrayifyValue',function(obj){
  const result = [];
  function isNumber(n){
      return typeof n == 'number' && !isNaN(n - n);
    }

  _.each(obj, function(e, k){
      if ( isNumber(parseInt(k))) {
        result.push({
          "title": k,
          "items": e
        });
      }
    });
    return result;
    console.log(result)
});


Template.registerHelper('isNaN', function (value) {
  function isNumber(n){
    return typeof n == 'number' && !isNaN(n - n);
  }
  return isNaN(parseInt(value));
});


Template.registerHelper('isBoolean', function (value) {
  if (value == true || value == false ) {
    return true
  }
});


Template.registerHelper('isSelf', function (user) {
  return Meteor.userId() === this.params._id;
});


Template.registerHelper('formatFormatorPass', function (value) {
  if ( value === "true" ) {
    return "Lulus"
  } else if ( value === "false") {
    return "Tidak Lulus"
  } else {
    return value;
  }
});

Template.registerHelper('formatPsStatus', function (value) {
  if ( value === true ) {
    return "Aktif"
  } else if ( value === false) {
    return "Non-Aktif"
  } else {
    return value;
  }
});

Template.registerHelper('getRevision', function (value) {
  if ( value === true ) {
    return "Dengan Revisi"
  } else if ( value === false) {
    return "Tanpa Revisi"
  } else {
    return value;
  }
});

// Template.registerHelper("isEmpty", function (object) {
//     return jQuery.isEmpty(object);
// });

Template.registerHelper('formatAnswer', function( value ) {

  if ( value == 1 ) {
    return "Sangat Kurang";
  } else if ( value == 2 ) {
    return "Kurang";
  } else if ( value == 3 ) {
    return "Cukup";
  } else if ( value == 4 ) {
    return "Baik";
  } else if ( value == 5 ) {
    return "Sangat Baik";
  } else {
    return value;
  }
});



Template.registerHelper('getDosen', function (value) {
  if (value){
    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": value
    });
    let dosenId = thisAcmatkul.dosenId;
    if ( thisAcmatkul.dosenName ) {
      return thisAcmatkul.dosenName;
    } else {
      let thisDosen = Meteor.users.findOne({"_id": dosenId});
      return thisDosen.fullname;
    }
  } else {
    return "Sine Username"
  }
});

Template.registerHelper('formatUsername', function (value) {
  if (value){
    let thisUser = Meteor.users.findOne({
      "_id": value
    });
    return thisUser.username;
  } else {
    return "Sine Username"
  }
});

Template.registerHelper('getTingkat', function (value) {
  if (value){
    let thisUser = Meteor.users.findOne({
      "_id": value
    });
    if (thisUser && !isNaN(thisUser.tingkat)) {
    return thisUser.tingkat;
    }
  } else {
    return "Sine Tingkat"
  }
});

Template.registerHelper('formatTingkatName', function (value) {
  let tingkat = parseInt(value);
  if ( value || value === 0 ){
    let thisTingkat = Tingkats.findOne({
      "tingkatId": tingkat
    });
    if (thisTingkat) {
      return thisTingkat.name;
    }
  } else {
    return "Sine"
  }
});

Template.registerHelper('formatAcmatkulName', function (value) {
  if (value){
    let thisMatkul = ActiveMatkuls.findOne({
      "_id": value
    });
    if (thisMatkul) {
      return thisMatkul.name;
    }
  } else {
    return "Not Found"
  }
});
Template.registerHelper('formatMatkulName', function (value) {
  if (value){
    let thisMatkul = MataKuliahs.findOne({
      "_id": value
    });
    return thisMatkul.name;
  } else {
    return "Not Found"
  }
});



Template.registerHelper('formatFullname', function (value) {
  if (value) {
    let thisUser = Meteor.users.findOne({
      "_id": value
    });
    if (thisUser) {
      return thisUser.fullname;
    }
  } else {
    return "Sine Nomine"
  }
});
Template.registerHelper('formatEmail', function (value) {
  if (value) {
    let thisUser = Meteor.users.findOne({
      "_id": value
    });
    return thisUser.emails[0].address;
  } else {
    return "Sine Emails"
  }
});
Template.registerHelper('formatNopokok', function (value) {
  if (value) {
    let thisUser = Meteor.users.findOne({
      "_id": value
    });
    return thisUser.noPokok;
  } else {
    return ""
  }
});

Template.registerHelper('formatPs', function (value) {
  if (value) {
    let thisPs = PeriodeStudis.findOne({
      "_id": value
    });
    if (thisPs !== undefined) {
      return thisPs.name;
    }
  } else {
    return "Unknown"
  }
});

Template.registerHelper('formatTUjian', function (value) {
  if (value) {
    if ( value === 1 ) {
      return "Tugas"
    } else if ( value === 2 ) {
      return "Test/Quiz"
    } else if ( value === 3 ) {
      return "UTS"
    } else if ( value === 4 ) {
      return "UAS"
    }
  } else {
    return "N/A"
  }
});

Template.registerHelper('listNotEmpty', function (array) {
  return array.length > 1;
});

Template.registerHelper('isUserInRole', function(role) {
  return Roles.userIsInRole(Meteor.user(), role);
});

Template.registerHelper('incremented', function (index) {
    index++;
    return index;
});


// legend fileTypeId
// 1 = bakulFiles
// 2 = profilePics
// 3 = rpsUploads
// 4 = taImages


Template.registerHelper('getFileLink', function (fileTypeId, value) {

  if ( value && fileTypeId ){
    if ( fileTypeId === 1 ) {
      let thisFile = bakulFiles.findOne({
        "_id": value
      });
      return thisFile.link();
    } else if ( fileTypeId === 1 ) {
      let thisFile = bakulFiles.findOne({
        "_id": value
      });
      return thisFile.link();
    } else if ( fileTypeId === 2 ) {
      let thisFile = profilePics.findOne({
        "_id": value
      });
      return thisFile.link();
    } else if ( fileTypeId === 3 ) {
      let thisFile = rpsUploads.findOne({
        "_id": value
      });
      return thisFile.link();
    } else if ( fileTypeId === 4 ) {
      let thisFile = taImages.findOne({
        "_id": value
      });
      return thisFile.link();
    } else if ( fileTypeId === 5 ) {
      let thisFile = ujianFiles.findOne({
        "_id": value
      });
      return thisFile.link();
    } else {
      return "fileType not recognized"
    }
  } else {
    return "Not Found"
  }
});



Template.registerHelper('getDay', function (value) {
  let day = parseInt(value);
  if ( value !== undefined ){
    let thisDay = _.findWhere(hariKuliahs, {"value": value });

    if (thisDay !== undefined) {
      return thisDay.label;
    }
  } else {
    return "Tidak Diketahui"
  }
});

Template.registerHelper('toMeteorId', function(context) {
  if(context) {
    const meteorId = context.toHexString();
    if (meteorId) {
      return meteorId;
    }
  }
});

Template.registerHelper('equalsInString', function (a, b) {
  return String(a) === String(b);
});


