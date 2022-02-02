import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';
import moment from 'moment';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';

import { Meetings } from '../../../api/alma-v1/db/collections-siakad.js';
import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { ujianTypeOptions } from '../../../api/alma-v1/db/collections-siakad.js';
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';
import { AcmatkulIndex } from '../../../api/alma-v1/db/collections-siakad.js';
import { Announcements } from '../../../api/alma-v1/db/collections-siakad.js';
import { hariKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';

import { rpsUploads } from '../../../api/alma-v1/db/collections-files.js';
import { bakulFiles } from '../../../api/alma-v1/db/collections-files.js';
import { ujianFiles } from '../../../api/alma-v1/db/collections-files.js';


// import ClassicEditor from '@ckeditor/ckeditor5-build-classic/build/ckeditor';

import './meetings.html';

const arr = new ReactiveArray([
]);

const fireSummernote = function(){
  $('.summernote').summernote({
      popover: {
       image: [],
       link: [],
       air: []
      },
      toolbar: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']]
      ]
  });
}


function enterLoading() {
  $('body').toggleClass('loading');
  $('button').attr("disabled", true);
}

function exitLoading(successStatus, callback) {
  if ( !successStatus ) {
    failAlert('Error')
    if (callback && typeof(callback) === "function") {
      callback();
    }
    $('body').toggleClass('loading');
    $('button').attr("disabled", false);
  } else {
    successAlert()
    if (callback && typeof(callback) === "function") {
      callback();
    }
    $('body').toggleClass('loading');
    $('button').attr("disabled", false);
  }
}



Template.meetingForm.helpers({
  amkId() {
    // const meetingId = Router.current().params._id;
    // const thisAmk = ActiveMatkuls.findOne({
    //   "_id": amkId
    // })
    // console.log(this)
    // console.log(this.amkId)
    return this.amkId;
  },
	amkUjians: function () {
		let	amkId = this.amkId;
		if (!amkId) {
			amkId = Router.current().params._id;
		}

		console.log(amkId);

		return Ujians.find({ "activeMatkulId": amkId }, {
			sort: {
				"date": 1
			}
		});

	}
});


Template.meetingForm.onRendered(function(){
	$('#input-datePublish').datetimepicker({
		"format": "YYYY-MM-DD HH:mm"
	});
	fireSummernote();
});

Template.meetingForm.events({
  
});

Template.meetingCreate.events({
  'click .submit-form': function(e, t) {
  	e.preventDefault();
    let self = $(event.target);
    const continueUpload = self.data('upload');

  	const amkId = Router.current().params._id;
  	const datePublish = $('#input-datePublish').val();
  	const description = $('#input-description').val();
  	const ujianId = $('#selectUjian').val();
  	Meteor.call('meetingCreate', amkId, datePublish, description, ujianId, function (error, result) {
  		if (error) {
        failAlert(error)
      } else {
        successAlert()
        if (continueUpload === "yes") {
          Router.go("meetingFiles", {
            "_id": result
          })
        } else {
          history.back();
        }
      }
  	});
  }
});

Template.meetingEdit.events({
  'click .submit-form': function(e, t) {
  	e.preventDefault();
  	const meetingId = Router.current().params._id;
  	const datePublish = $('#input-datePublish').val();
  	const description = $('#input-description').val();
  	const ujianId = $('#selectUjian').val();
  	Meteor.call('meetingEdit', meetingId, datePublish, description, ujianId, function (error, result) {
  		if (error) {
        failAlert(error)
      } else {
        successAlertBack()
      }
  	});
  }
});


Template.meetingDetails.onCreated(function(){
	const paramId = Router.current().params._id;

	const self = this;

  const handles = [
    Meteor.subscribe('meeting.details', paramId, function(){
      console.log("meeting details is ready");
	    Meteor.subscribe('activeMatkulDetails', self.data.amkId, function(){
		    console.log("amk details is ready");
	    });
    }),
    Meteor.subscribe('files.bakulFiles.all', function(){
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready")
    }
  });
})

Template.meetingDetails.helpers({
	ownAcmatkul (){
    const userId = Meteor.userId();
    const loggedInUser = Meteor.user();

    const amkId = this.amkId;
    console.log(amkId);
    const thisAcmatkul = ActiveMatkuls.findOne({
      "_id": amkId
    });

    if (thisAcmatkul) {
	    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
	      return true
	    };
    }
  },
});

Template.amkUjiansList.helpers({
  getScore(){
    const getStudent = _.findWhere(this.students, {"studentId": Meteor.user()._id });
    if(getStudent){
      return getStudent.score
    }
    else{
      return undefined
    }
  },
})

Template.ujianDoDetails.onCreated(function(){
	const paramId = Router.current().params._id;

  const handles = [
    Meteor.subscribe('ujianDetails', paramId, function(){
      console.log("ujian details is ready");
    })
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready")
    }
  });
})

Template.ujianDoDetails.helpers({
  enrolled(){
  	const studentsList = this.students;
  	const userId = Meteor.userId();
    let sdata = _.findWhere(studentsList, { "studentId": userId });
    if (sdata) {
    	return true;
    }
  },
  submitted(){
  	const studentsList = this.students;
  	const userId = Meteor.userId();
    let sdata = _.findWhere(studentsList, { "studentId": userId });
    if ( sdata.dateSubmitted ) {
    	return true
    }
  },
  sdata(){
  	const studentsList = this.students;
  	const userId = Meteor.userId();
    let sdata = _.findWhere(studentsList, { "studentId": userId });
		return sdata;
  },
  allowed(){
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getUTCMonth(), today.getUTCDate())).getTime()
    const dateStart = this.dateStart.getTime()
    const dateEnd = this.dateEnd.getTime()
    if(todayUTC >= dateStart && todayUTC <= dateEnd){
      return 1
    }
    else if(todayUTC < dateStart){
      return 2
    }
    else if(todayUTC > dateEnd){
      return 3
    }
  },
  thisFile (data) {
    const self = data.fileId.toString();
    const image = ujianFiles.findOne({
      "_id": self
    });
    if ( self && image ) {
      return image;
    }
  },
});

Template.meetingList.onCreated(function(){

})

Template.meetingList.helpers({
	meetings: function () {
		return Meetings.find({}, {
			sort: {
				"datePublish": 1
			}
		});
	}
});


Template.meetingEdit.onCreated(function(){
	let paramId = Router.current().params._id;
  const handles = [
    Meteor.subscribe('meeting.details', paramId, function(){
      // console.log("currentStudent is ready");
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready");
    }
  });
})

Template.meetingEdit.helpers({
  formCollection: function () {
    return Meetings;
  }
});




Template.meetingFiles.onCreated(function(){
  let paramId = Router.current().params._id;
  const handles = [
    Meteor.subscribe('meeting.details', paramId, function(){
      // console.log("currentStudent is ready");
    }),
    Meteor.subscribe('files.bakulFiles.all', function(){
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready")
    }
  });
})


Template.meetingFiles.helpers({
	formCollection: function () {
		return Meetings;
	}
});


Template.myMeetings.onCreated(function(){
  this.viewMode = new ReactiveVar(1);
  
  this.nowLoading = new ReactiveVar(true);
  let stillLoading = this.nowLoading;

  const handles = [
    Meteor.subscribe('meetings.my', function(){
      console.log("meeting my is ready");
    }),
    Meteor.subscribe('myAcmatkuls', function(){
      console.log("myAcmatkuls is ready");
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    if ( areReady === true ) {
      console.log("everything is ready")
      stillLoading.set(false);
    }
  });
})

Template.myMeetings.helpers({
  viewMode(){
    return Template.instance().viewMode.get()
  },
  stillLoading(){
    return Template.instance().nowLoading.get()
  }
})


Template.myMeetings.events({
  'click .toggle-view': function(e, t){
    e.preventDefault();
    let self = $(event.target);
    t.viewMode.set(self.data('view-target'));
  },
});

Template.myPastMeetings.helpers({
  pastMeetings(){
    const currentPs = PeriodeStudis.findOne({ "status": true });
    const psId = currentPs._id;
    const sod = moment().startOf('date');
    const userId = Meteor.userId();
    
    let myAmks;

    if ( Roles.userIsInRole(userId, ['dosen']) ) {
      myAmks = ActiveMatkuls.find({
        "psId": psId,
        "dosenId": userId,
      }).fetch();
    } else {
      myAmks = ActiveMatkuls.find({
        "psId": psId,
        "students.studentId": userId,
      }).fetch();
    }

    
    const myAmkIds = _.map(myAmks, function(num){
      return num._id;
    });
    const meetings = Meetings.find({
      "amkId": { $in: myAmkIds },
      "datePublish": { $lte: new Date(sod) }
    }, {
      sort: {
        "datePublish": 1
      }
    }).fetch();

    // console.log(myAmks)
    // console.log(myAmkIds)
    // console.log(meetings)
    return meetings;
  }
})


Template.myActiveMeetings.helpers({
  activeMeetings(){
    // const currentPs = PeriodeStudis.findOne({ "status": true });
    // const psId = currentPs._id;

    // console.log(psId)

    // const userId = Meteor.userId();

    // const myAmks = ActiveMatkuls.find({
    //   "psId": psId,
    //   "students.studentId": userId,
    // }).fetch();

    // const myAmkIds = _.map(myAmks, function(num){
    //   return num._id;
    // });


    // const sod = moment().startOf('date');

    // const meetings = Meetings.find({
    //   "amkId": { $in: myAmkIds },
    //   "datePublish": { $gte: new Date(sod) }
    // }, {
    //   sort: {
    //     "datePublish": 1
    //   }
    // }).fetch();

    // console.log(meetings)
    // return meetings;

    const currentPs = PeriodeStudis.findOne({ "status": true });
    const psId = currentPs._id;
    const sod = moment().startOf('date');
    const userId = Meteor.userId();
    
    let myAmks;

    if ( Roles.userIsInRole(userId, ['dosen']) ) {
      myAmks = ActiveMatkuls.find({
        "psId": psId,
        "dosenId": userId,
      }).fetch();
    } else {
      myAmks = ActiveMatkuls.find({
        "psId": psId,
        "students.studentId": userId,
      }).fetch();
    }

    
    const myAmkIds = _.map(myAmks, function(num){
      return num._id;
    });
    const meetings = Meetings.find({
      "amkId": { $in: myAmkIds },
      "datePublish": { $gte: new Date(sod) }
    }, {
      sort: {
        "datePublish": 1
      }
    }).fetch();

    // console.log(myAmks)
    // console.log(myAmkIds)
    // console.log(meetings)
    return meetings;
  }
})

Template.meetingAmkList.helpers({
	amkMeetings(){
		const amkId = Router.current().params._id;
		return Meetings.find({"amkId": amkId }, {
			sort: {
				"name": 1
			}
		});
	}
});

Template.meetingBoard.onCreated( function() {
  this.viewMode = new ReactiveVar(1);
  this.toggleForm = new ReactiveVar(false);
  
  this.nowLoading = new ReactiveVar(true);
  let stillLoading = this.nowLoading;

  const self = this;
  const meetingId = Router.current().params._id;

  this.thisAmk = new ReactiveVar();
  let amk = this.thisAmk;

  const handles = [
    Meteor.subscribe('meeting.details', meetingId, function(){
      console.log("meeting details is ready");
      if (self.data.amkId) {
        Meteor.subscribe('activeMatkulDetails', self.data.amkId, function(){
          console.log("amk details is ready");
          stillLoading.set(false);
          const theAmk = ActiveMatkuls.findOne({
            "_id": self.data.amkId
          });
          if (theAmk) {
            amk.set(theAmk);
          }
          fireSummernote();
        });
      }
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    if ( areReady === true ) {
      console.log("everything is ready")
    }
  });
});

Template.meetingBoard.helpers({
  stillLoading(){
    return Template.instance().nowLoading.get()
  },
  boardMessages() {
    const messages = this.boardMessages;
    return messages.reverse();

    // const sortedMessages = _.sortBy(messages, )
  },
  theAmk () {
    return Template.instance().thisAmk.get();
  },
  showForm(){
    return Template.instance().toggleForm.get();
  }
});

Template.meetingBoard.events({
  "click #toggle-form": function(e, t) {
    e.preventDefault();
    t.toggleForm.set(!t.toggleForm.get());
  },
  "click #go-big": function(e, t) {
    e.preventDefault();
    $('#discussion-board').toggleClass('big-text');
  },
  "click .delete-discussion": function(e, t) {
    e.preventDefault();
    enterLoading();
    const meetingId = Router.current().params._id;
    const mid = this._id;

    // console.log(mid);
    // console.log(this);

    Meteor.call('deleteDiscussion', meetingId, mid, function (error, result) {
      if ( error) {
        failAlert(error)
        exitLoading(false);
      } else {
        successAlert()
        exitLoading(true);
        fireSummernote();
      }
    });
  }
})

Template.discussionForm.onRendered(function(){
  fireSummernote();
})

Template.discussionForm.events({
  "click #submitDiscussion": function(e, t) {
    e.preventDefault();
    enterLoading();
    const meetingId = Router.current().params._id;
    const message = $('#dForm').val();

    // console.log(message);

    Meteor.call('submitDiscussion', meetingId, message, function (error, result) {
      if ( error) {
        failAlert(error)
        exitLoading(false);
      } else {
        successAlert()
        exitLoading(true);
        $('.summernote').summernote('reset');
      }
    });
  },

  
});