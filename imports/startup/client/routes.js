import { Meteor } from 'meteor/meteor';
import moment from 'meteor/momentjs:moment';

import { PeriodeStudis } from '../../api/alma-v1/db/collections.js';
import { Tingkats } from '../../api/alma-v1/db/collections.js';
import { ScoringItems } from '../../api/alma-v1/db/collections.js';
import { ScoreSheets } from '../../api/alma-v1/db/collections-assessment.js';
import { ScoringTemplates } from '../../api/alma-v1/db/collections.js';
import { ItemAnswers } from '../../api/alma-v1/db/collections.js';
import { Blogs } from '../../api/alma-v1/db/collections.js';
import { Books } from '../../api/alma-v1/db/collections-libraria.js';
import { LibTickets } from '../../api/alma-v1/db/collections-libraria.js';
import { MataKuliahs } from '../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../api/alma-v1/db/collections-siakad.js';
import { Ujians } from '../../api/alma-v1/db/collections-siakad.js';
import { TugasAkhirs } from '../../api/alma-v1/db/collections-siakad.js';
import { Announcements } from '../../api/alma-v1/db/collections-siakad.js';
import { Curricula } from '../../api/alma-v1/db/collections-siakad.js';
import { Meetings } from '../../api/alma-v1/db/collections-siakad.js';
import { KHS } from '../../api/alma-v1/db/collections-siakad.js';
import { Transcripts } from '../../api/alma-v1/db/collections-siakad.js';

import { CimUjians, CimUjianSheets } from '/imports/api/ujians/ujians.js';

import '../../../imports/ui/pages/imavi-cms/article.js';
import '../../../imports/ui/pages/assessment/assessments';
import '../../../imports/ui/pages/imavi-cms/general';
import '../../../imports/ui/pages/imavi-cms/landing';
import '../../../imports/ui/pages/libraria/library-main.js';
import '../../../imports/ui/pages/imavi-cms/news.js';
import '../../../imports/ui/pages/imavi-cms/outlet.js';
import '../../../imports/ui/pages/imavi-cms/page.js';
import '../../../imports/ui/pages/siakad/announcements.js';
// import '../../../imports/ui/pages/siakad/curricula.js';
import '../../../imports/ui/pages/siakad/khs.js';
import '../../../imports/ui/pages/siakad/matkuls.js';
import '../../../imports/ui/pages/siakad/meetings.js';
import '../../../imports/ui/pages/siakad/periodeStudis.js';
import '../../../imports/ui/pages/siakad/transcripts.js';
import '../../../imports/ui/pages/siakad/tugasAkhirs.js';
import '../../../imports/ui/pages/siakad/ujians.js';
import '../../../imports/ui/pages/cim/curricula.js';
import '../../../imports/ui/pages/cim/courses.js';
import '../../../imports/ui/pages/cim/participant.js';
import '../../../imports/ui/pages/cim/ujians.js';

import '../../../imports/ui/pages/komsos/sessions.js';
import '../../../imports/ui/pages/komsos/category.js';


import '../../../imports/ui/layouts/appBody/appBody.js';
import { CourseProgramsActive } from '../../api/coursePrograms/coursePrograms.js';

Router.configure({
  layoutTemplate: 'base',
  notFoundTemplate: 'notFound404',
  noRoutesTemplate: 'noRoutes'
  // waitOn: function(){
    // return Meteor.subscribe('users');
  // }
});

// Router.configure({
//   layoutTemplate: 'reportBase'
// });

Router.route('/', {
  name: 'home',
  template: 'home',
  // waitOn: function(){
  //   const currentStudentId = this.params._id;
  //   return [
  //     Meteor.subscribe('currentStudent', currentStudentId),
  //     // Meteor.subscribe('users'),
  //   ]
  // },
});

Router.route('homeLibraria', {
  name: 'homeLibraria',
  template: 'homeLibraria',
  // waitOn: function(){
  // },
});

Router.route('homeSiakad', {
  name: 'homeSiakad',
  template: 'homeSiakad',
  // waitOn: function(){
  // },
});

Router.route('homeAssessment', {
  name: 'homeAssessment',
  template: 'homeAssessment',
  // waitOn: function(){
  // },
});


Router.route('/mainMenu');
Router.route('/scoringTemplateForm');
Router.route('/scoringTemplatesList');

Router.route('/scoringItemForm');
Router.route('/scoringItemsList');

Router.route('/scoringItemGroupForm');
Router.route('/scoringItemGroupsList');

Router.route('/itemAnswerForm');
Router.route('/itemAnswersList');
Router.route('/answer/:_id/edit', {
  name: 'itemAnswerEdit',
  template: 'itemAnswerEdit',
  data: function(){
    var currentAnswer = this.params._id;
    return ItemAnswers.findOne({ _id: currentAnswer });
  },
  // waitOn: function(){
  //   return [
  //     // Meteor.subscribe('answers')
  //   ];
  // }
});

Router.route('/scoringTemplateList');

Router.route('/scoreSheetList');
Router.route('/mySubmittedSheets');


Router.route('/studentsList');

Router.route('/userCenter', {
  name: 'userCenter',
  template: 'userCenter',
  // waitOn: function(){
  //   return [
  //     // Meteor.subscribe('users')
  //   ];
  // }
});

Router.route('/configPage');

Router.route('/tingkatPage');
Router.route('/tingkat/:_id/edit', {
  name: 'tingkatEdit',
  template: 'tingkatEdit',
  data: function(){
    var currentTingkat = this.params._id;
    return Tingkats.findOne({ _id: currentTingkat });
  }
});

Router.route('/periodeStudisPage');


Router.route('/scoringTemplate/:_id', {
  name: 'scoringTemplateDetails',
  template: 'scoringTemplateDetails',
  data: function(){
    var currentTemplate = this.params._id;
    return ScoringTemplates.findOne({ _id: currentTemplate });
  }
});
Router.route('/scoringTemplate/:_id/edit', {
  name: 'scoringTemplateEdit',
  template: 'scoringTemplateEdit',
  data: function(){
    var currentTemplate = this.params._id;
    return ScoringTemplates.findOne({ _id: currentTemplate });
  }
});


Router.route('/student/:_id', {
  name: 'studentDetails',
  template: 'studentDetails',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
  // waitOn: function(){
  //   var currentStudent = this.params._id;
  //   return [
  //     Meteor.subscribe('currentStudent', currentStudent)
  //   ];
  // }
});

Router.route('/student/:_id/edit', {
  name: 'studentEdit',
  template: 'studentEdit',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  }
});

Router.route('/user/:_id', {
  name: 'userDetails',
  template: 'studentDetails',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
  waitOn: function(){
  }
});


Router.route('/user/:_id/edit', {
  name: 'userEdit',
  template: 'studentEdit',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  }
});

Router.route('/student/:_id/input', {
  name: 'studentScoringForm',
  template: 'studentScoringForm',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
});


Router.route('/student/:_id/krs', {
  name: 'studentKrs',
  template: 'studentKrs',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
});
Router.route('/student/:_id/khs', {
  name: 'studentKhs',
  template: 'studentKhs',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
});

Router.route('/student/:_id/transcript', {
  name: 'studentTranscript',
  template: 'transcriptDetails',
  data: function(){
    var currentStudent = this.params._id;
    let thisTranscript = Transcripts.findOne({ "studentId": currentStudent });
    let thisStudent = Meteor.users.findOne({ "_id": currentStudent });
    if (thisTranscript) {
      return thisTranscript;
    } else {
      Meteor.call('insertTranscript', currentStudent, function (error, result) {
        if (result) {
          return Transcripts.findOne({"_id": result});
        }
      });
    }
  },
});


Router.route('/student/:_id/report', {
  name: 'studentReport',
  template: 'studentReport',
  // waitOn: function(){
  //   var currentStudentId = this.params._id;
  //   return [

  //   ];
  // },
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
});





Router.route('/scoreSheets/:_id', {
  name: 'scoreSheetDetails',
  template: 'scoreSheetDetails',
  data: function(){
    var currentScoreSheet = this.params._id;
    return ScoreSheets.findOne({ _id: currentScoreSheet });
  },
  waitOn: function(){
    // return [
    //   // Meteor.subscribe('thisScoreSheet', this.params._id)
    // ];
  }
});

Router.route('/scoreSheet/:_id/print', {
  name: 'scoreSheetPrint',
  template: 'scoreSheetPrint',
  data: function(){
    this.layout('printLayout');
    var currentScoreSheet = this.params._id;
    return ScoreSheets.findOne({ _id: currentScoreSheet });
  },
  waitOn: function(){
    // return [
    //   Meteor.subscribe('thisScoreSheet', this.params._id)
    // ];
  }
});


// Router.route('/libraryStationHome', {
//   name: 'libraryStationHome',
//   template: 'libraryStationHome',
//   data: function(){
//     this.layout('libraryStationBase');
//     var currentUser = this.params._id;
//     return Meteor.users.find({ _id: currentUser });
//   },
//   waitOn: function(){
//     return [
//       Meteor.subscribe('booksList'),
//       Meteor.subscribe('users'),
//     ];
//   }
// });

Router.route('/scoreSheet/:_id/pdf', {
  name: 'scoreSheetPdf',
  template: 'scoreSheetPdf',
  data: function(){
    var currentScoreSheet = this.params._id;
    return ScoreSheets.findOne({ _id: currentScoreSheet });
  }
});

Router.route('/scoreSheet/:_id/check', {
  name: 'scoreSheetCheck',
  template: 'scoreSheetCheck',
  data: function(){
    var currentScoreSheet = this.params._id;
    return ScoreSheets.findOne({ _id: currentScoreSheet });
  },
  waitOn: function(){
    // return [
    //   Meteor.subscribe('thisScoreSheet', this.params._id)
    // ];
  }

});

Router.route('/scoreSheet/:_id/edit', {
  name: 'scoreSheetEdit',
  template: 'scoreSheetEdit',
  data: function(){
    var currentScoreSheet = this.params._id;
    return ScoreSheets.findOne({ _id: currentScoreSheet });
  }
});



// Router.route('/periodeStudi/:_id', {
//   name: 'periodeStudiDetails',
//   template: 'periodeStudiDetails',
//   data: function(){
//     var periodeStudi = this.params._id;
//     return PeriodeStudis.findOne({ _id: periodeStudi });
//   }
// });



Router.route('/periodeReport', {
  name: 'periodeReport',
  template: 'periodeReport',
  layoutTemplate: 'reportBase',
  waitOn: function(){
    return [
      Meteor.subscribe('sheetsCurrentPeriod'),
      Meteor.subscribe('scoringItemsList'),
      Meteor.subscribe('users'),
      Meteor.subscribe('answers')
    ];
  }
});




Router.route('/student/:_id/report/print', {
  name: 'studentReportPrint',
  template: 'studentReportPrint',
  data: function(){
    this.layout('printLayout');
    var currentStudentId = this.params._id;
    return Meteor.users.findOne({ _id: currentStudentId });
  },
  waitOn: function(){
    // return [
    //   // Meteor.subscribe('currentStudent', this.params._id)
    // ];
  },
   onAfterAction: function () {
   },
});





Router.route('/matkulPage/', {
  name: 'matkulPage',
  template: 'matkulPage',
  waitOn: function(){
    return [
      // Meteor.subscribe('users'),
      // Meteor.subscribe('matkulList'),
      // Meteor.subscribe('periodeStudis'),
    ];
  }
});


Router.route('/matkul/:_id', {
  name: 'matkulDetails',
  template: 'matkulDetails',
  data: function(){
    var matkulId = this.params._id;
    return MataKuliahs.findOne({ _id: matkulId });
  },
  waitOn: function(){
    // var matkulId = this.params._id;
    // return [
    //   Meteor.subscribe('matkulDetails', matkulId)
    // ];
  }
});

Router.route('/matkul/:_id/edit', {
  name: 'matkulEdit',
  template: 'matkulEdit',
  data: function(){
    var matkulId = this.params._id;
    return MataKuliahs.findOne({ _id: matkulId });
  },
  waitOn: function(){
    // var matkulId = this.params._id;
    // return [
    //   Meteor.subscribe('matkulDetails', matkulId)
    // ];
  }
});




Router.route('/periodeStudi/:psId/', {
  name: 'psDetails',
  template: 'psDetails',
  data: function(){
    var psId = this.params.psId;
    return PeriodeStudis.findOne({ _id: psId });
  },
  waitOn: function(){
    // var psId = this.params.psId;
    // return [
    //   // Meteor.subscribe('acmatkulsListScoped', psId)
    // ];
  }
});



Router.route('/periodeStudi/:psId/print', {
  name: 'psDetailsPrint',
  template: 'psDetailsPrint',
  layoutTemplate: 'printLayout',
  data: function(){
    var psId = this.params.psId;
    return PeriodeStudis.findOne({ _id: psId });
  },
});



Router.route('/activeMatkul/:_id', {
  name: 'activeMatkulDetails',
  template: 'activeMatkulDetails',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/edit', {
  name: 'activeMatkulEdit',
  template: 'activeMatkulEdit',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/bakuls', {
  name: 'activeMatkulBakul',
  template: 'activeMatkulBakul',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});


Router.route('/activeMatkul/:_id/announcementForm', {
  name: 'announcementForm',
  template: 'announcementForm',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // let paramId = this.params._id;
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});


Router.route('/activeMatkul/:_id/scoreForm', {
  name: 'scoreForm',
  template: 'scoreForm2',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // let paramId = this.params._id;
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

// Router.route('/announcement/:_id/edit', {
//   name: 'announcementEdit',
//   template: 'announcementEdit',
//   data: function(){
//     var activeMatkulId = this.params._id;
//     return ActiveMatkuls.findOne({ _id: activeMatkulId });
//   },
//   waitOn: function(){
//     // let paramId = this.params._id;
//     // var activeMatkulId = this.params._id;
//     // return [
//     //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
//     // ];
//   }
// });

Router.route('/activeMatkul/:_id/syllabus', {
  name: 'activeMatkulSyllabus',
  template: 'activeMatkulSyllabus',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/syllabus/print', {
  name: 'activeMatkulSyllabusPrint',
  template: 'activeMatkulSyllabus',
  layoutTemplate: 'printLayout',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/rps', {
  name: 'activeMatkulRps',
  template: 'activeMatkulRps',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   // Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/manageStudents', {
  name: 'activeMatkulStudentsForm',
  template: 'activeMatkulStudentsForm',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  }
});


Router.route('/activeMatkul/:_id/rps/print', {
  name: 'activeMatkulRpsPrint',
  template: 'activeMatkulRpsPrint',
  layoutTemplate: 'printLayout',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    // var activeMatkulId = this.params._id;
    // return [
    //   Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    // ];
  }
});

Router.route('/activeMatkul/:_id/attendanceFormPrint', {
  name: 'attendanceFormPrint',
  template: 'attendanceFormPrint',
  layoutTemplate: 'printLayout',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    var activeMatkulId = this.params._id;
    return [
      // Meteor.subscribe('activeMatkulDetails', activeMatkulId),
      // Meteor.subscribe('userSearch')
    ];
  }
});

Router.route('/activeMatkul/:_id/teachingJournal/print', {
  name: 'teachingJournalPrint',
  template: 'teachingJournalPrint',
  layoutTemplate: 'printLayout',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    var activeMatkulId = this.params._id;
    return [
      // Meteor.subscribe('activeMatkulDetails', activeMatkulId),
      // Meteor.subscribe('userSearch')
    ];
  }
});

Router.route('/activeMatkul/:_id/teachingJournal', {
  name: 'teachingJournal',
  template: 'teachingJournal',
  // layoutTemplate: 'printLayout',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    var activeMatkulId = this.params._id;
    return [
      // Meteor.subscribe('activeMatkulDetails', activeMatkulId),
      // Meteor.subscribe('userSearch')
    ];
  }
});



Router.route('/activeMatkul/:_id/ujianInput', {
  name: 'ujianInput',
  template: 'ujianInput',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
    var activeMatkulId = this.params._id;
    return [
      Meteor.subscribe('activeMatkulDetails', activeMatkulId)
    ];
  }
});


Router.route('/activeMatkul/:_id/ujianReport', {
  name: 'ujianReport',
  template: 'ujianReport',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  // waitOn: function(){
  //   var activeMatkulId = this.params._id;
  //   return [
  //     // Meteor.subscribe('activeMatkulDetails', activeMatkulId),
  //     // Meteor.subscribe('ujianListScoped', activeMatkulId),
  //   ];
  // }
});



Router.route("/ujiansList");
Router.route("/ujiansListActive");



Router.route('/ujian/:_id', {
  name: 'ujianDetails',
  template: 'ujianDetails',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  waitOn: function(){
    var ujianId = this.params._id;
    return [
      // Meteor.subscribe('ujianDetails', ujianId),
      // Meteor.subscribe('userSearch')
    ];
  }
});

Router.route('/ujian/:_id/edit', {
  name: 'ujianEdit',
  template: 'ujianEdit',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  // waitOn: function(){
  //   var ujianId = this.params._id;
  //   return [
  //     Meteor.subscribe('ujianDetails', ujianId),
  //     Meteor.subscribe('userSearch')
  //   ];
  // }
});


Router.route('/ujian/:_id/inputScore', {
  name: 'inputScoreView',
  template: 'inputScoreView',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  waitOn: function(){
    var ujianId = this.params._id;
    return [
      // Meteor.subscribe('ujianDetails', ujianId),
      // Meteor.subscribe('userSearch')
    ];
  }
});


Router.route('/ujian/:_id/print', {
  name: 'ujianPrint',
  template: 'ujianPrint',
  layoutTemplate: 'printLayout',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  waitOn: function(){
    // var ujianId = this.params._id;
    // return [
    //   Meteor.subscribe('ujianDetails', ujianId),
    //   Meteor.subscribe('userSearch')
    // ];
  }
});





Router.route('/ujian/:_id/printAttendance', {
  name: 'ujianDetailsPrintAttendance',
  template: 'ujianDetailsPrintAttendance',
  layoutTemplate: 'printLayout',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  // waitOn: function(){
  //   var ujianId = this.params._id;
  //   let ujian = Ujians.findOne({
  //     "_id": ujianId
  //   });
  //   let acmatkulId = ujian.activeMatkulId;
  //   return [
  //     Meteor.subscribe('ujianDetails', ujianId),
  //     Meteor.subscribe('activeMatkulDetails', acmatkulId),
  //     Meteor.subscribe('userSearch')
  //   ];
  // }
});




Router.route('/ujian/:_id/printScores', {
  name: 'ujianDetailsPrintScores',
  template: 'ujianDetailsPrintScores',
  layoutTemplate: 'printLayout',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ "_id": ujianId });
  }
});

Router.route('/ujian/:_id/do', {
  name: 'ujianDo',
  template: 'ujianDo',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  waitOn: function(){
    var ujianId = this.params._id;
    return [
      // Meteor.subscribe('ujianDetails', ujianId),
      // Meteor.subscribe('userSearch')
    ];
  }
});

Router.route('/ujian/:_id/doDetails', {
  name: 'ujianDoDetails',
  template: 'ujianDoDetails',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  }
});

Router.route('/ujian/:_id/grade/:studentId', {
  name: 'ujianGrade',
  template: 'ujianGrade',
  data: function(){
    var ujianId = this.params._id;
    return Ujians.findOne({ _id: ujianId });
  },
  waitOn: function(){
    var ujianId = this.params._id;
    return [
      // Meteor.subscribe('ujianDetails', ujianId),
      // Meteor.subscribe('userSearch')
    ];
  }
});

// ****************************************************************************
// *                                 LIBRARIA                                 *
// ****************************************************************************


Router.route('/booksList');


Router.route('/book/:_id', {
  name: 'bookDetails',
  template: 'bookDetails',
  data: function(){
    var bookId = this.params._id;
    return Books.findOne({ _id: bookId });
  },
  waitOn: function(){
    var bookId = this.params._id;
    return [
      Meteor.subscribe('bookDetails', bookId)
    ];
  }
});

Router.route('/book/:_id/edit', {
  name: 'bookEdit',
  template: 'bookEdit',
  data: function(){
    var bookId = this.params._id;
    return Books.findOne({ _id: bookId });
  },
  waitOn: function(){
    var bookId = this.params._id;
    return [
      Meteor.subscribe('bookDetails', bookId)
    ];
  }
});




// ****************************************************************************
// *                                   BLOGS                                  *
// ****************************************************************************


Router.route('/blogCreate', {
  name: 'blogCreate',
  template: 'blogCreate',
});

Router.route('/blogsList');


Router.route('/blog/:_id', {
  name: 'blogDetails',
  template: 'blogDetails',
  data: function(){
    var blogId = this.params._id;
    return Blogs.findOne({ _id: blogId });
  },
  waitOn: function(){
    var blogId = this.params._id;
    return [
      Meteor.subscribe('blogDetails', blogId),
    ];
  }
});

Router.route('/blog/:_id/edit', {
  name: 'blogEdit',
  template: 'blogEdit',
  data: function(){
    var blogId = this.params._id;
    return Blogs.findOne({ _id: blogId });
  },
  waitOn: function(){
    var blogId = this.params._id;
    return [
      Meteor.subscribe('blogDetails', blogId),
      Meteor.subscribe('userSearch')
    ];
  }
});

Router.route('/taForm', {
  name: 'taForm',
  template: 'taForm',
  data: function(){
    var currentStudent = this.params._id;
    return Meteor.users.findOne({ _id: currentStudent });
  },
});

Router.route('/taList');
Router.route('/ta/:_id', {
  name: 'taDetails',
  template: 'taDetails',
  data: function(){
    var paramId = this.params._id;
    return TugasAkhirs.findOne({ _id: paramId });
  },
  waitOn: function(){
    var paramId = this.params._id;
    return [
      Meteor.subscribe('taDetails', paramId),
    ];
  }
});

Router.route('/ta/:_id/edit', {
  name: 'taEdit',
  template: 'taEdit',
  data: function(){
    var paramId = this.params._id;
    return TugasAkhirs.findOne({ _id: paramId });
  },
  waitOn: function(){
    var paramId = this.params._id;
    return [
      Meteor.subscribe('taDetails', paramId),
      Meteor.subscribe('userSearch'),
    ];
  }
});

Router.route('/announcementCreate', {
  name: 'announcementCreate',
  template: 'announcementCreate',
});

Router.route('/announcementsList');
Router.route('/announcementsListActive');

Router.route('/announcement/:_id/edit', {
  name: 'announcementEdit',
  template: 'announcementEdit',
  data: function(){
    var paramId = this.params._id;
    return Announcements.findOne({ _id: paramId });
  },
  waitOn: function(){
    var paramId = this.params._id;
    return [
      Meteor.subscribe('announcementDetails', paramId)
    ];
  }
});

// ****************************************************************************
// *                                ASSESSMENT                                *
// ****************************************************************************

Router.route('/activeMatkul/:_id/assessment', {
  name: 'amkAssessmentForm',
  template: 'amkAssessmentForm',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
  }
});

Router.route('/activeMatkul/:amkId/assessment/:sheetId/feedback', {
  name: 'amkFeedbackForm',
  template: 'amkFeedbackForm',
  data: function(){
    var amkId = this.params.amkId;
    return ActiveMatkuls.findOne({ _id: amkId });
  },
  waitOn: function(){
  }
});

Router.route('/assessment/:_id/detail', {
  name: 'amkAssessmentDetail',
  template: 'amkAssessmentDetail',
  data: function(){
    var paramId = this.params._id;
    console.log(paramId);
    return ScoreSheets.findOne({ _id: paramId });
  }
});

Router.route('/activeMatkul/:_id/assessmentReport', {
  name: 'amkAssessmentReport',
  template: 'amkAssessmentReport',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  },
  waitOn: function(){
  }
});

Router.route('/assessment/list', {
  name: 'assessmentList',
  template: 'assessmentList',
});

// ****************************************************************************
// *                            ALMA NEXT MAIN START                          *
// ****************************************************************************

Router.route('/main/users/list',{
  name : 'mainUserList',
  template : 'mainUserList'
});

Router.route('/main/users/create',{
  name : 'mainUserCreate',
  template : 'mainUserCreate'
});

Router.route('/main/users/edit/:_id', {
  name: 'mainUserEdit',
  template: 'mainUserEdit'
});

Router.route('/main/roles/list',{
  name : 'roleList',
  template : 'roleList'
});

Router.route('/main/roles/create',{
  name : 'roleCreate',
  template : 'roleCreate'
});

Router.route('/main/roles/edit/:_id', {
  name: 'roleEdit',
  template: 'roleEdit'
});

Router.route('/main/config-super',{
  name : 'configSuper',
  template : 'configSuper'
});

// ****************************************************************************
// *                            ALMA NEXT MAIN END                            *
// ****************************************************************************

// ****************************************************************************
// *                                    CIM LMS START                         *
// ****************************************************************************

// ****************************************************************************
// *                                  CURRICULA                                  *
// ****************************************************************************
Router.route('/cim/curricula/list',{
  name : 'curriculaList',
  template : 'curriculaList'
});

Router.route('/cim/curricula/create',{
  name : 'curriculaCreate',
  template : 'curriculaCreate',
});

// Router.route('/cim/curriculum/:_id/edit', {
//   name: 'curriculumEdit',
//   template: 'curriculumEdit',
// });

Router.route('/cim/curricula/:_id/edit', {
  name: 'curriculaEdit',
  template: 'curriculaEdit'
});

// ****************************************************************************
// *                                  Courses                                 *
// ****************************************************************************

Router.route('/cim/courses/list',{
  name : 'coursesList',
  template : 'coursesList'
});

Router.route('/cim/courses-active/:_acpId/certificate', {
  name : 'acpCertificateCreate',
  template : 'acpCertificateCreate'
})

Router.route('/cim/courses/create',{
  name : 'coursesCreate',
  template : 'coursesCreate',
});

Router.route('/cim/courses/edit/:_id', {
  name: 'coursesEdit',
  template: 'coursesEdit'
});

Router.route('/cim/courses-active/list/', {
  name : 'activeCoursesList',
  template : 'activeCoursesList'
})

Router.route('/cim/courses-active/create', {
  name : 'activeCoursesCreate',
  template : 'activeCoursesCreate'
})

Router.route('/cim/courses-active/edit/:_id', {
  name : 'activeCoursesEdit',
  template : 'activeCoursesEdit'
})

Router.route('/cim/courses-active/:_acpId/material/list', {
  name : 'acpMaterialList',
  template : 'acpMaterialList'
})

Router.route('/cim/courses-active/:_acpId/material/create', {
  name : 'acpMaterialCreate',
  template : 'acpMaterialCreate',
  data: function(){
    var paramId = this.params._acpId;
    const objectId = new Mongo.Collection.ObjectID(paramId);
    return CourseProgramsActive.findOne({ _id: objectId });
  }
})

Router.route('/cim/courses-active/:_acpId/material/edit/:_id', {
  name : 'acpMaterialEdit',
  template : 'acpMaterialEdit',
  data : function() {
    const paramId = this.params._acpId;
    const objectId = new Mongo.Collection.ObjectID(paramId);
    return CourseProgramsActive.findOne({ _id: objectId });
  }
})

Router.route('/cim/courses-active/:_acpId/ujian/list', {
  name : 'acpUjianList',
  template : 'acpUjianList'
})

Router.route('/cim/courses-active/:_acpId/ujian/create', {
  name : 'acpUjianCreate',
  template : 'acpUjianCreate',
  data: function(){
    const paramId = this.params._acpId;
    const objectId = new Mongo.Collection.ObjectID(paramId);
    return CourseProgramsActive.findOne({ _id: objectId });
  }
})

Router.route('/cim/courses-active/:_acpId/ujian/edit/:_id', {
  name : 'acpUjianEdit',
  template : 'acpUjianEdit',
  data : function() {
    const paramId = this.params._acpId;
    const objectId = new Mongo.Collection.ObjectID(paramId);
    return CourseProgramsActive.findOne({ _id: objectId });
  }
})

Router.route('/cim/courses-active/:_acpId/ujian/:_id/sheets', {
  name: 'acpUjianSheetList',
  template: 'acpUjianSheetList',
});

Router.route('/cim/courses-active/:_acpId/ujian/:_ujianId/sheets/:_id', {
  name: 'acpUjianSheetDetail',
  template: 'acpUjianSheetDetail',
});

Router.route('/cim/courses-active/:_acpId/participant/list', {
  name : 'acpParticipantList',
  template : 'acpParticipantList'
})

// ****************************************************************************
// *                                   Participants                                 *
// ****************************************************************************

Router.route('/cim/participant/list', {
  name : 'participantsList',
  template : 'participantsList',
});

Router.route('/cim/participant/registration', {
  name : 'registrationList',
  template : 'registrationList',
});

Router.route('/cim/participant/registration/:_id', {
  name : 'registrationEdit',
  template : 'registrationEdit',
});

Router.route('/cim/participant/new-registration', {
  name : 'registrationNew',
  template : 'registrationNew',
});

Router.route('/cim/participant/create', {
  name : 'participantsCreate',
  template : 'participantsCreate',
});

Router.route('/cim/participant/edit/:_id', {
  name : 'participantsEdit',
  template : 'participantsEdit',
});

Router.route('/cim/ujians/:_id/sheets', {
  name: 'cimUjianSheetsList',
  template: 'cimUjianSheetsList',
  data: function(){
    var ujianId = this.params._id;
    return CimUjians.findOne({ _id: ujianId });
  },
});

// ****************************************************************************
// *                                    CIM LMS END                           *
// ****************************************************************************

// ****************************************************************************
// *                                    IMAVI CMS START                       *
// ****************************************************************************

Router.route('/imavi-cms/documents/create', {
  name: 'documentCreate',
  template: 'documentCreate',
});

Router.route('/imavi-cms/documents/list', {
  name: 'documentList',
  template: 'documentList',
});

Router.route('/imavi-cms/documents/edit/:_id', {
  name: 'documentEdit',
  template: 'documentEdit',
});

Router.route('/imavi-cms/lecturers/list', {
  name: 'lecturerList',
  template: 'lecturerList',
});

Router.route('/imavi-cms/lecturers/edit/:_id', {
  name: 'lecturerEdit',
  template: 'lecturerEdit',
});

Router.route('/imavi-cms/articles/list', {
  name: 'listArticle',
  template: 'listArticle'
});

Router.route('/imavi-cms/articles/create', {
  name: 'createArticle',
  template: 'createArticle'
});

Router.route('/imavi-cms/articles/edit/:_id', {
  name: 'editArticle',
  template: 'editArticle'
});

Router.route('/imavi-cms/news/list', {
  name: 'listNews',
  template: 'listNews'
});

Router.route('/imavi-cms/news/create', {
  name: 'createNews',
  template: 'createNews'
});

Router.route('/imavi-cms/news/edit/:_id', {
  name: 'editNews',
  template: 'editNews'
});

Router.route('/imavi-cms/general/list', {
  name: 'listGeneral',
  template: 'listGeneral'
});

Router.route('/imavi-cms/general/create', {
  name: 'createGeneral',
  template: 'createGeneral'
});

Router.route('/imavi-cms/general/edit/:_id', {
  name: 'editGeneral',
  template: 'editGeneral'
});

// Createnya sudah masuk disini
Router.route('/imavi-cms/outlets/list', {
  name: 'listOutlet',
  template: 'listOutlet'
});

Router.route('/imavi-cms/outlets/edit/:_id', {
  name: 'editOutlet',
  template: 'editOutlet'
});

Router.route('/imavi-cms/pages/list', {
  name: 'listPage',
  template: 'listPage'
});

Router.route('/imavi-cms/pages/create', {
  name: 'createPage',
  template: 'createPage'
});

Router.route('/imavi-cms/pages/edit/:_id', {
  name: 'editPage',
  template: 'editPage'
});

// ****************************************************************************
// *                                    IMAVI CMS END                         *
// ****************************************************************************

// ****************************************************************************
// *                                    KHS                                   *
// ****************************************************************************

Router.route('/khs/list', {
  name: 'khsList',
  template: 'khsList',
});

Router.route('/khs/:_id/details', {
  name: 'khsDetails',
  template: 'khsDetails',
  data: function(){
    let paramId = this.params._id;
    return KHS.findOne({ _id: paramId });
  },
  waitOn: function(){
    let paramId = this.params._id;
    return [
      Meteor.subscribe('khsDetails', paramId),
    ];
  }
});

// ****************************************************************************
// *                                Transcripts                               *
// ****************************************************************************

Router.route('/transcript/list', {
  name: 'transcriptList',
  template: 'transcriptList',
  waitOn: function(){
    return [
      Meteor.subscribe('transcriptsList'),
    ];
  }
});

Router.route('/transcript/:_id/details', {
  name: 'transcriptDetails',
  template: 'transcriptDetails',
  data: function(){
    let paramId = this.params._id;
    return Transcripts.findOne({ "studentId": paramId });
  },
  waitOn: function(){
    let paramId = this.params._id;
    return [
      Meteor.subscribe('transcriptDetails', paramId),
    ];
  }
});

Router.route('/transcript/:_id/inject', {
  name: 'transcriptInject',
  template: 'transcriptInject',
  data: function(){
    let paramId = this.params._id;
    return Transcripts.findOne({ "studentId": paramId });
  },
  waitOn: function(){
    let paramId = this.params._id;
    return [
      Meteor.subscribe('transcriptDetails', paramId),
      Meteor.subscribe('matkulList'),
    ];
  }
});

// ****************************************************************************
// *                                Meeetings                               *
// ****************************************************************************


Router.route('/activeMatkul/:_id/meeting/create', {
  name: 'meetingCreate',
  template: 'meetingCreate',
  data: function(){
    var activeMatkulId = this.params._id;
    return ActiveMatkuls.findOne({ _id: activeMatkulId });
  }
});

Router.route('/meeting/list', {
  name: 'meetingList',
  template: 'meetingList',
  waitOn: function(){
    return [
      Meteor.subscribe('meeting.all'),
    ];
  }
});

Router.route('/meeting/:_id/edit', {
  name: 'meetingEdit',
  template: 'meetingEdit',
  data: function(){
    let paramId = this.params._id;
    return Meetings.findOne({ "_id": paramId });
  },
  waitOn: function(){
    let paramId = this.params._id;
    return [
      Meteor.subscribe('meeting.details', paramId),
    ];
  }
});

Router.route('/meeting/:_id/detail', {
  name: 'meetingDetails',
  template: 'meetingDetails',
  data: function(){
    let paramId = this.params._id;
    return Meetings.findOne({ "_id": paramId });
  },
  waitOn: function(){
    let paramId = this.params._id;
    return [
      Meteor.subscribe('meeting.details', paramId),
    ];
  }
});

Router.route('/meeting/:_id/upload', {
  name: 'meetingFiles',
  template: 'meetingFiles',
  data: function(){
    let paramId = this.params._id;
    return Meetings.findOne({ "_id": paramId });
  },
  waitOn: function(){
    // let paramId = this.params._id;
    return [
      // Meteor.subscribe('meeting.details', paramId),
      // Meteor.subscribe('files.bakulFiles.all'),
    ];
  }
});

Router.route('/meeting/:_id/discussion', {
  name: 'meetingBoard',
  template: 'meetingBoard',
  data: function(){
    let paramId = this.params._id;
    return Meetings.findOne({ "_id": paramId });
  },
  waitOn: function(){
    // let paramId = this.params._id;
    return [
      // Meteor.subscribe('meeting.details', paramId),
      // Meteor.subscribe('files.bakulFiles.all'),
    ];
  }
});

// ****************************************************************************
// *                                KOMSOS                                *
// ****************************************************************************

Router.route('/sessionsList/', {
  name : 'sessionsList',
  template  : 'sessionsList'
});
Router.route('/sessionCreate/', {
  name : 'sessionCreate',
  template  : 'sessionCreate'
});
Router.route('/sessionEdit/:_id', {
  name : 'sessionEdit',
  template  : 'sessionEdit'
});
Router.route('/categorysList/', {
  name : 'categorysList',
  template  : 'categorysList'
});
Router.route('/categoryCreate/', {
  name : 'categoryCreate',
  template  : 'categoryCreate'
});
Router.route('/categoryEdit/:_id', {
  name : 'categoryEdit',
  template  : 'categoryEdit'
});