import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';

import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { ujianTypeOptions } from '../../../api/alma-v1/db/collections-siakad.js';
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';
import { AcmatkulIndex } from '../../../api/alma-v1/db/collections-siakad.js';
import { Announcements } from '../../../api/alma-v1/db/collections-siakad.js';

import { rpsUploads } from '../../../api/alma-v1/db/collections-files.js';
import { bakuls } from '../../../api/alma-v1/db/collections-files.js';

import './announcements.html';


const fireSummernote = function(){
  $('textarea').summernote({
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

Template.announcementForm.onCreated(function(){

})

Template.announcementForm.onRendered(function(){
	setTimeout(function(){ 
    fireSummernote();
  }, 200);
})

Template.announcementForm.helpers({
	
});
Template.announcementForm.events({
	'submit form': function (event, template) {
		event.preventDefault();
		let title = $('#inputTitle').val();
		let description = $('#inputDescription').val();
		let dateStart = $('#dateStart').val();
		let dateEnd = $('#dateEnd').val();
		let paramId = Router.current().params._id;

		Meteor.call('createAnnouncements', paramId, title, description, dateStart, dateEnd, function (error, result) {
			if (error) {
        failAlert(error)
      } else {
        successAlertBack()
      }
		});
	}
});


Template.acmatkulAnnouncements.onCreated(function(){
  let paramsId = Router.current().params._id;
  Tracker.autorun(() => {
		Meteor.subscribe('acmatkulAnnouncements', paramsId, function(){
      console.log('acmatkulAnnouncements ready now');
    });
  });
})

Template.acmatkulAnnouncements.helpers({
	ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if (thisAcmatkul !== undefined ) {
	    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
	      return true
	    };
    }
  },
	pastAnnouncements(){
    let paramId = Router.current().params._id;
    return Announcements.find({
      "activeMatkulId": paramId,
      "dateEnd": { $lte: new Date() }
    }).fetch();
  },
  futureAnnouncements(){
    let paramId = Router.current().params._id;
    return Announcements.find({
      "activeMatkulId": paramId,
      "dateStart": { $gte: new Date() }
    }).fetch();
  },
  activeAnnouncements(){
    let paramId = Router.current().params._id;
    return Announcements.find({
      "activeMatkulId": paramId,
      "dateStart": { $lte: new Date() },
      "dateEnd": { $gte: new Date() }
    }).fetch();
  }
});

Template.amkAnnouncementListItem.helpers({
	ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = this.activeMatkulId;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if (thisAcmatkul != undefined ) {

	    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
	      return true
	    };
    }
  },
});



Template.myActiveAnnouncements.onCreated(function(){
  let paramsId = Router.current().params._id;
  Tracker.autorun(() => {
		Meteor.subscribe('myActiveAnnouncements', paramsId, function(){
      console.log('myActiveAnnouncements ready now');
    });
  });
})

Template.myActiveAnnouncements.helpers({
	ownAcmatkul (){
    const userId = Meteor.userId();
    const activeMatkulId = this.activeMatkulId;

    const thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if ( thisAcmatkul ) {
	    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(userId, ['admin','superadmin']) ) {
	      return true
	    };
    };
  },
	announcements(){
    let loggedInUser = Meteor.user();
	  if (Roles.userIsInRole(loggedInUser, ['admin', 'superadmin'])) {
	    return Announcements.find({ 
	      $and: [
	        { "dateStart": { $lte: new Date() } },
	        {
	          $or: [
	            { "dateEnd": { $gte: new Date() } },
	            { "dateEnd": null }
	          ]
	        }
	      ]
	    });
	  } else {
	    // find my acmatkuls in this psid - myacmatkularray
	    const userId = Meteor.userId();
	    const thisPS = PeriodeStudis.findOne({
	      "status": true
	    });
	    if ( thisPS ) {
		    const psId = thisPS._id;
		    const activeMatkuls = ActiveMatkuls.find({
		      "psId": psId,
		      "students.studentId": userId
		    }).fetch();
		    const myAcmatkuls = _.map(activeMatkuls, "_id");
        // console.log(myAcmatkuls)
		    // // find announcements acmatkulid $in acmatkulsArray
		    const myAnnouncements = Announcements.find({ 
		      $and: [
		        { "activeMatkulId": {
		            $in: myAcmatkuls
		          } 
		        },
		        { "dateStart": { $lte: new Date() } },
		        {
		          $or: [
		            { "dateEnd": { $gte: new Date() } },
		            { "dateEnd": null }
		          ]
		        }
		      ]
		    });
        console.log(myAnnouncements)
		    return myAnnouncements;
	    }
	  }
  }
});

Template.announcementEdit.onRendered(function(){
	setTimeout(function(){ 
    fireSummernote();
  }, 200);
})

Template.announcementEdit.helpers({
	formCollection: function () {
		return Announcements;
	},
	ownAcmatkul(){
    let annId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAnn = Announcements.findOne({
      "_id": annId
    });
    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": thisAnn.activeMatkulId
    });

    console.log(thisAnn);
    console.log(thisAcmatkul);

    if (thisAcmatkul !== undefined ) {
	    if ( loggedInUser._id === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
	      return true
	    };
    }
	},
});

Template.announcementEdit.events({
	'click #submitForm': function(e, t){
		e.preventDefault();
		enterLoading()
		let paramId = Router.current().params._id;

		let title = $('#inputTitle').val();
		let description = $('#inputDescription').val();
		let dateStart = $('#dateStart').val();
		let dateEnd = $('#dateEnd').val();

		Meteor.call('editAnnouncement', paramId, title, description, dateStart, dateEnd, function (error, result) {
			if (error) {
        failAlert(error)
        exitLoading(false)
      } else {
        exitLoading(true)
        successAlertBack()
      }
		});
	},
	'click #deleteAnnouncement': function (e, t) {
		e.preventDefault();
		enterLoading()
		let paramId = Router.current().params._id;
		Meteor.call('deleteAnnouncement', paramId, function (error, result) {
			if (error) {
        exitLoading(false)
        failAlert(error)
      } else {
        exitLoading(true)
        successAlertBack('Terhapus...')
      }
		});
	},
	'click #broadcastAnnouncement': function(e, t) {
		e.preventDefault();
		enterLoading()
		let paramId = Router.current().params._id;
		Meteor.call('sendEmail', paramId, function (error, result) {
			if (error) {
        failAlert(error)
        exitLoading(false)
      } else {
        successAlert('Terkirim')
        exitLoading(true)
      }
		});
	}
});