import {
    Meteor
} from 'meteor/meteor';
import {
    Roles
} from 'meteor/alanning:roles';

import moment from 'moment';
import _ from 'underscore';

import { ScoringTemplates } from '../db/collections.js';
import { PeriodeStudis } from '../db/collections.js';
import { Tingkats } from '../db/collections.js';
import { Blogs } from '../db/collections.js';

import { ScoreSheets } from '../db/collections-assessment.js';
import { ScoringItems } from '../db/collections-assessment.js';
import { ItemAnswers } from '../db/collections-assessment.js';

import { Books } from '../db/collections-libraria.js';
import { LibTickets } from '../db/collections-libraria.js';

import { KHS } from '../db/collections-siakad.js';
import { Transcripts } from '../db/collections-siakad.js';

import { MataKuliahs } from '../db/collections-siakad.js';
import { ActiveMatkuls } from '../db/collections-siakad.js';
import { Ujians } from '../db/collections-siakad.js';
import { TugasAkhirs } from '../db/collections-siakad.js';
import { Announcements } from '../db/collections-siakad.js';
import { Curricula } from '../db/collections-siakad.js';
import { Meetings } from '../db/collections-siakad.js';

import { Uploads } from '../db/collections-files.js';
import { taImages } from '../db/collections-files.js';
import { profilePics } from '../db/collections-files.js';
import { rpsUploads } from '../db/collections-files.js';
import { bakulFiles } from '../db/collections-files.js';
import { ujianFiles } from '../db/collections-files.js';


import { CimCurriculas , IvanTeams} from '../db/collections-cimCenter.js';
import { CoursePrograms, CourseProgramsActive } from '/imports/api/coursePrograms/coursePrograms.js';

//TODO mungkin ini tidak disini diletakkannya kalau mengacu K3
import { Outlet } from '../db/collections-outlet.js'
import { Article } from '../db/collections-articles.js'
import { News } from '../db/collections-news.js'
import { General } from '../db/collections-general.js'
import { Page } from '../db/collections-pages.js'
import { Documents } from '../db/collections-landing.js'
import { documentPics, documentFiles, generalPics } from '../db/collections-files.js'
import { AppProfiles, AppUsers } from '../db/collections-profiles.js';
import { AcpMaterials } from '../../coursePrograms/coursePrograms.js';
import { CimUjians } from '../../ujians/ujians.js';

import { Sessions , Categorys, Parokis} from '../db/collections-komsosCenter';


Meteor.publish("userSearch", function() {
    let loggedInUser = Meteor.user();

    if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
        return Meteor.users.find({}, {
            fields: {}
        });
    } else {
        return Meteor.users.find({
      }, {
        fields: {
          "_id": 1,
          "emails": 1,
          "fullname": 1,
          "tingkat": 1,
          "roles": 1,
          "noPokok": 1,
          "outlets": 1
        }
      });
    }
});


Meteor.publish("studentsList", function() {
    let loggedInUser = Meteor.user();

    // if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator', 'dosen'])) {
        // return Meteor.users.find({}, {
        //     fields: {}
        // });
    // } else {
        return Meteor.users.find({
            "roles": "student"
        }, {
            fields: {
                "_id": 1,
                "fullname": 1,
                "tingkat": 1,
            }
        });
    // }
});
Meteor.publish("usersList", function() {
    let loggedInUser = Meteor.user();

    if (Roles.userIsInRole(loggedInUser, ['superadmin'])) {
        return Meteor.users.find({}, {
          fields: {
            password: 0
          }
        });
    } else {
        return Meteor.users.find({
            // "roles": { $nin:
            //   ["formator", "admin"]
            // }
        }, {
            fields: {
                "_id": 1,
                "fullname": 1,
                "tingkat": 1,
            }
        });
    }
});

Meteor.publish("dosensList", function() {
    let loggedInUser = Meteor.user();

    if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator', 'dosen'])) {
        return Meteor.users.find({}, {
            fields: {}
        });
    } else {
        return Meteor.users.find({
          "roles": "dosen"
        }, {
            fields: {
                "_id": 1,
                "fullname": 1,
                "noPokok": 1,
                "extendedProfiles": 1
            }
        });
    }
});

Meteor.publish("adminsList", function() {
  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator', 'dosen'])) {
    return Meteor.users.find({}, {
      fields: {}
    });
  } else {
    return Meteor.users.find({
      "roles": "admin"
    }, {
      fields: {
        "_id": 1,
        "fullname": 1,
      }
    });
  }
});


Meteor.publish("superadminsList", function() {
  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator', 'dosen'])) {
    return Meteor.users.find({}, {
      fields: {}
    });
  } else {
    return Meteor.users.find({
      "roles": "superadmin"
    }, {
      fields: {
        "_id": 1,
        "fullname": 1,
      }
    });
  }
});


Meteor.publish("thisScoreSheet", function(scoreSheetId) {
    check(scoreSheetId, String);
    let loggedInUser = Meteor.user();
    if (Roles.userIsInRole(loggedInUser, ['superadmin','admin', 'formator'])) {
        return ScoreSheets.find({
            "_id": scoreSheetId
        }, {
            fields: {}
        });
    } else {
        return ScoreSheets.find({
            "_id": scoreSheetId
        }, {
            fields: {
                "_id": 1,
                "name": 1,
            }
        });
    }
});


Meteor.publish("users", function () {
  let loggedInUser = Meteor.user();
  if (Roles.userIsInRole(loggedInUser, ['superadmin','admin', 'formator'])) {
      return Meteor.users.find({});
  } else {
    return Meteor.users.find({}, {
      fields: {
        "tingkat": 1,
        "username": 1,
        "fullname": 1,
        "emails": 1,
        "roles": 1
      }
    });
  }
});



Meteor.publish("currentStudent", function (currentStudentId) {
  if (currentStudentId) {
    return Meteor.users.find({"_id": currentStudentId });
  }
});


Meteor.publish("periodeStudis", function() {
  return PeriodeStudis.find({
    "status": true
  });
});


Meteor.publish("tingkats", function() {
  return Tingkats.find({
  }, {
    sort: {
      "tingkatId": 1
    }
  });
})

Meteor.publish("curricula", function() {
  return Curricula.find({

  }, {
    fields: {
      "name": 1,
      "description": 1
    }
  });
});
Meteor.publish("cimCurricula", function() {
  return CimCurriculas.find({

  }, {
    fields: {
      "name": 1,
      "description": 1,
      "courseList" : 1,
      "excerpt": 1,
      "slug": 1
    }
  });
});

Meteor.publish("thisCurriculum", function(paramId) {
  check(paramId, String);

  return Curricula.find({
    "_id": paramId
  }, {
    fields: {
      "name": 1,
      "description": 1
    }
  });
})



Meteor.publish("scoresheetStudent", function(subjectId){
  let currentPS = PeriodeStudis.findOne({
    "status": true
  });

  if (Roles.userIsInRole(loggedInUser, ['superadmin','admin', 'formator'])) {
        return ScoreSheets.find({
          "subjectId": subjectId,
          "periodeStudi": currentPS._id,
        }, {
            // fields: {}
        });
    } else {
      return "unauthorized";
    }
})


Meteor.publish('sheetsCurrentPeriod', function(){
  let currentPS = PeriodeStudis.findOne({
    "status": true
  });
  return ScoreSheets.find({
    "periodeStudi": currentPS._id,
  }, {

  })
})


Meteor.publish('scoringItemsList', function(){
  return ScoringItems.find({});
});


Meteor.publish('answers', function(){
  return ItemAnswers.find({});
});

Meteor.publish('booksList', function(){
  return Books.find({});
});

Meteor.publish('libTicketsSearch', function(){
  return LibTickets.find({});
});


Meteor.publish("bookDetails", function(bookId) {
  return Books.find({
    "_id": bookId
  });
})


Meteor.publish('matkulList', function(){
  return MataKuliahs.find({});
});
Meteor.publish('coursesList', function(){
  return CoursePrograms.find({});
});


Meteor.publish("matkulDetails", function(matkulId) {
  return MataKuliahs.find({
    "_id": matkulId
  });
})

Meteor.publish("ujianDetails", function(ujianId) {
  return Ujians.find({
    "_id": ujianId
  });
})


Meteor.publish("ujianList", function() {
  return Ujians.find({
  });
})
Meteor.publish("ujianListScoped", function( acmatkulId ) {
  return Ujians.find({
    "activeMatkulId": acmatkulId,
  }, {
    sort: {
      "date": 1
    }
  });
})



Meteor.publish('activeMatkulList', function(){

  let thisPS = PeriodeStudis.findOne({
    "status": true
  });

  return ActiveMatkuls.find({
      "psId": thisPS._id,
    }, {
    sort: {
      "name": 1
    },
  },{
    // fields: {
      // "matkulId": 1,
      // "name": 1,
      // "dosenId": 1,
    // }
  });
});

Meteor.publish("activeMatkulDetails", function(activeMatkulId) {
  return ActiveMatkuls.find({
    "_id": activeMatkulId
  });
})

Meteor.publish("acmatkulsListScoped", function( psId ) {
  return ActiveMatkuls.find({
    "psId": psId,
  }, {
    sort: {
      "name": 1
    }
  });
})


Meteor.publish("myAcmatkuls", function() {
  let thisPS = PeriodeStudis.findOne({
    "status": true
  });

  let loggedInUser = Meteor.user();
  let userId = Meteor.userId();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator', 'dosen'])) {
    return ActiveMatkuls.find({
      "psId": thisPS._id,
    }, {
      sort: {
        "name": 1
      }
    });

  } else {
    return ActiveMatkuls.find({
      "psId": thisPS._id,
      "students.$.studentId": loggedInUser._id
    }, {
      sort: {
        "name": 1
      }
    });
  }
})

Meteor.publish("dosensAcmatkuls", function( userId ) {
  check(userId, String);

  let thisPS = PeriodeStudis.find({
    "status": true
  });
  return ActiveMatkuls.find({
    "psId": thisPS._id,
    "dosenId": userId
  }, {
    sort: {
      "name": 1
    }
  });
})

Meteor.publish("studentAcmatkuls", function( userId ) {
  check(userId, String);

  let thisPS = PeriodeStudis.find({
    "status": true
  });
  return ActiveMatkuls.find({
    "psId": thisPS._id,
    "students": userId
  }, {
    sort: {
      "name": 1
    }
  });
})



Meteor.publish("blogsList", function() {

  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
    return Blogs.find({
      // "psId": psId,
      }, {
        sort: {
          "createdAt": 1
        },
        fields: {
          "title": 1,
          "author": 1,
          "createdBy": 1
        }
      });
    } else {
    return Blogs.find({
      "createdBy": Meteor.userId,
      }, {
      sort: {
        "createdAt": 1
      },
      fields: {
        "title": 1,
        "author": 1,
        "createdBy": 1
      }
    });
  }
});


Meteor.publish("blogDetails", function( blogId ) {
  return Blogs.find({
    "_id": blogId,
  }, {
  });
})


Meteor.publish("taList", function(){
  return TugasAkhirs.find();
})


Meteor.publish("taDetails", function( taId ) {
  return TugasAkhirs.find({
    "_id": taId,
    }, {
  });
})



Meteor.publish("ujiansListActive", function(){
  let currentPS = PeriodeStudis.findOne({
    "status": true,
  });
  return Ujians.find({
    "periodeStudi": currentPS._id,
    "date": {
        $gte: new Date()
      }
    }, {
  })
})



Meteor.publish("ujiansList", function(){
  return Ujians.find({})
});

Meteor.publish("uploads", function(){
  return Uploads.find({
  }, {
  })
});


Meteor.publish('files.taImages.all', () => {
  return taImages.collection.find({});
});


Meteor.publish('files.profilePics.all', () => {
  return profilePics.collection.find({});
});

Meteor.publish('files.rpsUploads.all', () => {
  return rpsUploads.collection.find({});
});

Meteor.publish('files.bakulFiles.all', () => {
  return bakulFiles.collection.find({});
});

Meteor.publish('files.ujianFiles.all', () => {
  return bakulFiles.collection.find({});
});


Meteor.publish('acmatkulAnnouncements', function(acmatkulId){

  return Announcements.find({
    $and: [
      {"activeMatkulId": acmatkulId},
      { "dateStart": { $lte: new Date() } },
      {
        $or: [
          { "dateEnd": { $lte: new Date() } },
          { "dateEnd": null }
        ]
      }
    ]
  });
})


Meteor.publish('myActiveAnnouncements', function(){
  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin'])) {
    return Announcements.find({
      $and: [
        { "dateStart": { $lte: new Date() } },
        {
          $or: [
            { "dateEnd": { $lte: new Date() } },
            { "dateEnd": null }
          ]
        }
      ]
    });
  } else {
    // find my acmatkuls in this psid - myacmatkularray
    let userId = Meteor.userId();
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    let psId = thisPS._id;
    let activeMatkuls = ActiveMatkuls.find({
      "psId": psId,
      "students.studentId": userId
    }).fetch();
    let myAcmatkuls = _.map(activeMatkuls, function(num){
      return num._id;
    })

    // // find announcements acmatkulid $in acmatkulsArray
    let myAnnouncements = Announcements.find({
      $and: [
        { "activeMatkulId": {
            $in: myAcmatkuls
          }
        },
        { "dateStart": { $lte: new Date() } },
        {
          $or: [
            { "dateEnd": { $lte: new Date() } },
            { "dateEnd": null }
          ]
        }
      ]
    });
    return myAnnouncements;
  }

})

Meteor.publish('activeAnnouncements', function(){
  return Announcements.find({
    $and: [
      { "dateStart": { $lte: new Date() } },
      {
        $or: [
          { "dateEnd": { $lte: new Date() } },
          { "dateEnd": null }
        ]
      }
    ]
  });
})


Meteor.publish("announcementDetails", function( paramId ) {
  return Announcements.find({
    "_id": paramId,
  }, {
  });
})


Meteor.publish('studentKHS', function(studentId){
  check(studentId, String);
  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
    return KHS.find({
      "studentId": studentId
    });
  } else {
    if ( loggedInUser._id === studentId ) {
      return KHS.find({
      "studentId": studentId
    });
    } else {
      return this.ready;
    }
  }
})

Meteor.publish("khsDetails", function( paramId ) {
  check(paramId, String);
  let loggedInUser = Meteor.user();

  let thisKHS = KHS.find({
      "_id": paramId
    });

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
    return thisKHS;
  } else {
    if ( loggedInUser._id === thisKHS.studentId ) {
      return thisKHS;
    } else {
      return this.ready;
    }
  }
})


Meteor.publish('transcriptsList', function(){
  let loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
    return Transcripts.find({});
  } else {
    if ( loggedInUser._id === studentId ) {
      return Transcripts.find({
      "studentId": studentId
    });
    } else {
      return this.ready;
    }
  }
})

Meteor.publish("transcriptDetails", function( paramId ) {
  check(paramId, String);
  let loggedInUser = Meteor.user();

  let thisTranscript = Transcripts.find({
    "_id": paramId
  });

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'formator'])) {
    return thisTranscript;
  } else {
    if ( loggedInUser._id === thisTranscript.studentId ) {
      return thisTranscript;
    } else {
      return this.ready();
    }
  }
})

Meteor.publish('meeting.all', function(){
  return Meetings.find({});
})

Meteor.publish('meeting.details', function(meetingId){
  if ( meetingId ) {
    check(meetingId, String);
    return Meetings.find({"_id": meetingId});
  } else {
    return this.ready;
  }
})

Meteor.publish('meeting.amk', function(amkId){
  if ( amkId ) {
    check(amkId, String);
    return Meetings.find({"amkId": amkId});
  } else {
    return this.ready;
  }
})

Meteor.publish('meetings.my', function(){
  let userId = Meteor.userId();
  let loggedInUser = Meteor.user();

  const currentPs = PeriodeStudis.findOne({ "status": true });
  const psId = currentPs._id;

  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin'])) {
      return Meteor.users.find({}, {
          fields: {}
      });
  } else {
      return Meteor.users.find({
    }, {
      fields: {
        "_id": 1,
        "emails": 1,
        "fullname": 1,
        "tingkat": 1,
        "roles": 1,
        "noPokok": 1
      }
    });
  }

  const myAmks = ActiveMatkuls.find({
    "psId": psId,
    "students.studentId": userId,
  }).fetch();

  const myAmkIds = _.map(myAmks, function(num){
    return num._id;
  });

  const eod = moment().endOf('date');

  return Meetings.find({
    "amkId": { $in: myAmkIds },
  }, {
    sort: {
      "datePublish": 1
    }
  })

})


Meteor.publish('amk.ujians.list', function(amkId){

  if (amkId) {
    check(amkId, String);
    return Ujians.find({
      "activeMatkulId": amkId
    })
  } else {
    return this.ready();
  }

});

Meteor.publish("outlet", function() {
  return Outlet.find({},{
    sort:{
      'createdAt': 1
    }
  });
});
Meteor.publish("article", function() {
  const $in = []
  const userOutlets = Meteor.user().outlets
  if(userOutlets){
    userOutlets.forEach(element => {
      $in.push(element)
    });
  }
  return Article.find({
    outlets: { $in }
  });
});
Meteor.publish("news", function() {
  const $in = []
  const userOutlets = Meteor.user().outlets
  if (userOutlets) {
    userOutlets.forEach(element => {
      $in.push(element)
    });
  }
  return News.find({
    outlets : { $in }
  });
});
Meteor.publish("general", function() {
  // const $in = []
  // const userOutlets = Meteor.user().outlets
  // if (userOutlets) {
  //   userOutlets.forEach(element => {
  //     $in.push(element)
  //   });
  // }
  return General.find({
    // outlets : { $in }
  });
});
Meteor.publish("pages", function() {
  const $in = []
  const userOutlets = Meteor.user().outlets
  if (userOutlets) {
    userOutlets.forEach(element => {
      $in.push(element)
    });
  }
  return Page.find({
    outlets : { $in }
  });
});
Meteor.publish("documentList", function() {
  const $in = []
  const userOutlets = Meteor.user().outlets
  if (userOutlets) {
    userOutlets.forEach(element => {
      $in.push(element)
    });
  }
  return Documents.find({
    outlets : { $in }
  });
});
Meteor.publish("documentPicList", function() {
  return documentPics.find({}).cursor;
});
Meteor.publish("documentFileList", function() {
  return documentFiles.find({}).cursor;
});
Meteor.publish("generalPicList", function() {
  return generalPics.find({}).cursor;
});
Meteor.publish("cimCourses", function() {
  return CoursePrograms.find({});
});
Meteor.publish("cimActiveCourses", function() {
  return CourseProgramsActive.find({});
});
Meteor.publish("cimActiveCoursesMaterials", function() {
  return AcpMaterials.find({});
});
Meteor.publish("getAllLecturers", function() {
  // const userOutlets = Meteor.user().outlets;
  // if(userOutlets){
  //   userOutlets.forEach(element => {
  //     $in.push(element)
  //   });
  // }
  return AppProfiles.find({
    profileType : "dosen"
  },{
    sort : {
      'fullName' : 1
    }
  });
})
Meteor.publish("getAllProfiles", function() {
  return AppProfiles.find({},{
    sort : {
      'fullName' : 1
    }
  });
})
Meteor.publish("getAllAppUsers", function() {
  return AppUsers.find({},{
    sort : {
      'fullName' : 1
    }
  });
})

Meteor.publish('cimUjians', function() {
  return CimUjians.find({},{
    sort : {
      'name' : 1
    }
  })
})

Meteor.publish('getIvanTeams', function(){
  return IvanTeams.find({},{
    sort: {
      'name' : 1
    }
  })
});

Meteor.publish('getCategorysList', function() {
  return Categorys.find({},{
    sort : {
      'name' : 1
    }
  });
});
Meteor.publish('getParokisList', function() {
  return Parokis.find({},{
    sort : {
      'name' : 1
    }
  });
});
Meteor.publish('getSessionsList', function() {
  return Sessions.find();
});

