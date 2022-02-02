// Client entry point, imports all client code
import '/imports/startup/client';
import '/imports/startup/both';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Tingkats, PeriodeStudis } from '../imports/api/alma-v1/db/collections.js';

import SimpleSchema from 'simpl-schema';
import _ from 'underscore';

import './main.html';


enterLoading = function() {
  $('button').attr("disabled", true);
  $('body').addClass('loading');
}

exitLoading = function(successState, callback) {
  if ( successState ) {
    $('button').attr("disabled", false);
    $('body').removeClass('loading');
    if (callback) {
      callback();
    }
  } else {
    $('button').attr("disabled", false);
    $('body').removeClass('loading');
    if (callback) {
      callback();
    }
  }
}


const arr = new ReactiveArray([]);

Template.base.onCreated( function (){
  var instance = this;
  let userId = Meteor.userId();
  Tracker.autorun(() => {
    Meteor.subscribe('thisUser', userId, function(){
      console.log("thisUser is ready");
    });
  });
  let currentPeriodeStudi = PeriodeStudis.findOne({
    "status": true
  });
  this.showCreateForm = new ReactiveVar(false);
  // let userDefaultSystem = Meteor.user().defaultSystem;
  // this.currentSystem = new ReactiveVar(userDefaultSystem);
  // console.log(userDefaultSystem)
});

Template.base.helpers({
  
});

Template.base.events({
  'click #historyBack': function (event, template) {
    event.preventDefault();
    history.back();
  }
});

Template.navigation.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log("user search is ready")
    })
  });
})

Template.navigation.helpers({
  operatorUsername: function () {
    return Meteor.user().fullname;
  }
});

Template.home.onCreated( function(){
  let currentStudentId = Meteor.userId();
  Tracker.autorun(() => {
    Meteor.subscribe('currentStudent', currentStudentId, function(){
      console.log("currentStudent is ready")
    })
    Meteor.subscribe('userSearch', function(){
      console.log("user search is ready")
    })
    Meteor.subscribe('periodeStudis', function(){
      console.log("periodeStudis is ready")
    });
  });
});


Template.footer.onCreated( function(){
  let thisUser = Meteor.user();
  Tracker.autorun(() => {

  });
});

Template.footer.events({
  'change #selectSystem': function (event, template) {
    event.preventDefault();
    let value = event.target.value;
    console.log(value);
    if ( value == 0 ){
      Router.go('home');
      successAlert('To Assessment')
    } else if ( value == 1 ) {
      Router.go('homeLibraria');
      successAlert('To Libraria')
    } else if ( value == 2 ) {
      Router.go('homeSiakad');
      successAlert('To Siakad')
    }
  }
});

Template.mainMenu.onCreated( function(){
  // let userId = Meteor.userId();
  Tracker.autorun(() => {
    Meteor.subscribe('periodeStudis');
  });
});


Template.mainMenu.onRendered( function(){
});

Template.mainMenu.helpers({
  today: function () {
    let today = moment(new Date()).format("YYYY-MM-DD");
    return today;
  },
  currentPsId (){

    let currentPs = PeriodeStudis.findOne({
      "status": true
    });

    if (currentPs !== undefined) {
      return currentPs._id;
    }
  }
});

Template.mainMenu.events({
  'click .rebuild-website' (e, t) {
    const siteId = $(e.currentTarget).data('site-id');
    if (siteId) {
      console.log(siteId);
      Meteor.call('rebuildWebsite', siteId, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert('Built success!')
        }
      });
    } else {
      successAlert('Site ID not found!')
    }
  }
})

Template.homeAdmin.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe("currentPs", function(){
      console.log("currentPS is ready");
    });
  });
})



Template.homeSiakad.onCreated(function(){
  this.showJadwal = new ReactiveVar(false);
  this.viewNavMode = new ReactiveVar(2);

  Tracker.autorun(() => {
    Meteor.subscribe("currentPs", function(){
      console.log("current ps is ready");
    });
  });
})

Template.homeSiakad.helpers({
  currentPsId (){
    let currentPs = PeriodeStudis.findOne({
      "status": true
    });
    return currentPs._id;
  },
  showJadwal (){
    return Template.instance().showJadwal.get();
  },
  viewNavMode: function () {
    return Template.instance().viewNavMode.get();
  },
});

Template.homeSiakad.events({
  'click #toggleJadwal': function (event, template) {
    event.preventDefault();
    template.showJadwal.set(!template.showJadwal.get());
  },
  'click .toggle-nav-view': function(e, t){
    e.preventDefault();
    let self = $(event.target);
    t.viewNavMode.set(self.data('view-nav-target'));
  },
});



Template.homeAdmin.helpers({
  currentPsId (){
    let currentPs = PeriodeStudis.findOne({
      "status": true
    });
    return currentPs._id;
  }
});



Template.homeStudent.helpers({
  currentPsId (){
    let currentPs = PeriodeStudis.findOne({
      "status": true
    });
    return currentPs._id;
  }
});



Template.commonMenus.events({
  'click #mustLogout': function () {
    event.preventDefault();
    Meteor.logout();
  },
});

Template.tingkatPage.onCreated(function(){
  this.tingkatForm = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe("matkulList", function(){
      console.log("matkulList is ready");
    });
    Meteor.subscribe("tingkats", function(){
      console.log("tingkats is ready");
    });
  });
});

Template.tingkatPage.helpers({
  formCollection () {
    return Tingkats;
  },
  tingkatForm(){
    return Template.instance().tingkatForm.get();
  },
  tingkat () {
    return Tingkats.find({}, {
      sort: {
        "tingkatId": 1
      }
    });
  },
  scoringTemplate() {
    return ScoringTemplates.find({});
  }
});



Template.tingkatPage.events({
  'click #toggle-tingkat-form': function (event, template) {
    event.preventDefault();
    template.tingkatForm.set( !template.tingkatForm.get());
  },
  // 'change .selectTemplate': function (event, template ) {
  //   event.preventDefault();
  //   Meteor.call('changeTemplateId',  , function (error, result) {
  //     if (error) {
  //       Bert.alert({
  //         title: 'Error',
  //         message: error.reason,
  //         type: 'danger',
  //         style: 'growl-top-right',
  //         icon: 'fa-times'
  //       });
  //     } else {
  //       Bert.alert({
  //         title: 'Success',
  //         message: result,
  //         type: 'success',
  //         style: 'growl-top-right',
  //         icon: 'fa-thumbs-up'
  //       });
  //     }
  //   });
  // }
});

// Template.periodeStudisPage.onCreated(function(){
//   this.periodeForm = new ReactiveVar(false);
//   this.periodeSwitch = new ReactiveVar(false);
//   Tracker.autorun(() => {
//     Meteor.subscribe("periodeStudis", function(){
//       console.log("periodestudis is ready");
//     });
//   });

// });

Template.tingkatEdit.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe("tingkats", function(){
      console.log("tingkats is ready");
    });
  });
})


Template.tingkatEdit.helpers({
  formCollection () {
    return Tingkats;
  },
});

Template.tingkatEdit.events({
  'click #delete-tingkat': function (event, template) {
    event.preventDefault();
    let paramsId = Router.current().params._id;
    Meteor.call('deleteTingkat', paramsId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        Router.go('home')
      }
    });
    // console.log(paramsId)
  }
});


Template.userCenter.onCreated(function(){
  this.nowListing = new ReactiveVar(1);
  this.searchOn = new ReactiveVar(false);
  // this.roleConfigs = new ReactiveVar(false);
  const self = this;
  self.autorun(function(){
    self.subscribe('users');
  });
});

Template.userCenter.onRendered( function(){
})


Template.userCenter.helpers({
  'user': function(){
    return Meteor.users.find({
      "roles": {
        $in: ["formator", "admin", "superadmin", "libraryStation"]
      }
    }, {sort: {fullname: 1} }).fetch();
  },
  userRole (){
    return Roles.getRolesForUser( this._id );
  },
  // defaultSystem(){
  //   let thisUser = Meteor.users.findOne({
  //     "_id": this._id
  //   });
  //   return thisUser.defaultSystem;
  // },


  nowListing(){
    return Template.instance().nowListing.get();
  },
  searchOn(){
    return Template.instance().searchOn.get();
  },
});


Template.userCenter.events({
  'click .getRoles': function(event, template){
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('getRoles', thisUser);
    console.log(Roles.getRolesForUser( this._id ));
    // console.log(result);
  },
  'click .removeUser': function(event, template){
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('deleteUser', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " forever.")
      }
    });
  },
  'change #selectSystem': function(event, template){
    event.preventDefault();
    let selectedSystem = event.target.value;
    let thisUserId = this._id;
    Meteor.call('changeDefaultSystem', thisUserId, selectedSystem, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        $('#selectSystem').val(result);
        console.log(result)
      }
    });
  },
  'change #selectDisplay': function(event, template){
    event.preventDefault();
    console.log(event.target.value)
    template.nowListing.set(parseInt(event.target.value))
  },
  'click #toggleSearch': function(event, template) {
    event.preventDefault();
    template.searchOn.set(!template.searchOn.get());
  },
  
});

Template.configUserRoles.helpers({
  roles: function () {
    console.log(this)
    console.log(Roles.getRolesForUser( this._id ))
    // return this;
    return Roles.getRolesForUser( this._id );
  }
});

Template.configUserRoles.events({
  'click .set-formator': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, '');
    Meteor.call('addAsFormator', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as formator.")
      }
    });
    // Roles.addUsersToRoles( thisUser, 'formator' );
  },
  'click .removeAsFormator': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsFormator', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as formator.")
      }
    });
  },
  'click .setMahasiswa': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, 'admin');
    Meteor.call('addAsMahasiswa', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as mahasiswa.")
      }
    });
  },
  'click .removeAsMahasiswa': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsMahasiswa', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as mahasiswa.")
      }
    });
  },
  'click .set-admin': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, 'admin');
    Meteor.call('addAsAdmin', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as admin.")
      }
    });
  },
  'click .removeAsAdmin': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsAdmin', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as admin.")
      }
    });
  },
  'click .set-superadmin': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, 'superadmin');
    Meteor.call('addAsSuperAdmin', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as superadmin.")
      }
    });
  },
  'click .unset-superadmin': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsSuperAdmin', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as superadmin.")
      }
    });
  },
  'click #set-library-station': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, '');
    Meteor.call('addAsLibraryStation', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as library-station.")
      }
    });
    // Roles.addUsersToRoles( thisUser, 'formator' );
  },
  'click #unset-library-station': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsLibraryStation', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as library-station.")
      }
    });
  },
  'click #set-librarian': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, '');
    Meteor.call('addAsLibrarian', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as librarian.")
      }
    });
    // Roles.addUsersToRoles( thisUser, 'formator' );
  },
  'click #unset-librarian': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsLibrarian', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as librarian.")
      }
    });
  },

  'click #set-dosen': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, '');
    Meteor.call('addAsDosen', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as dosen.")
      }
    });
    // Roles.addUsersToRoles( thisUser, 'formator' );
  },
  'click #unset-dosen': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsDosen', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as dosen.")
      }
    });
  },
  'click #set-rektor': function () {
    event.preventDefault();
    let thisUser = this._id;
    // Roles.removeUsersFromRoles( users.thisUser, '');
    Meteor.call('addAsRektor', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Added " + thisUser + " as rektor.")
      }
    });
    // Roles.addUsersToRoles( thisUser, 'formator' );
  },
  'click #unset-rektor': function () {
    event.preventDefault();
    let thisUser = this._id;
    Meteor.call('removeAsRektor', thisUser, function(error, results) {
      if (error) {
        console.log(error.reason);
      } else {
        console.log("Removed " + thisUser + " as rektor.")
      }
    });
  },
});


SimpleSchema.debug = true;

Accounts.ui.config({
   passwordSignupFields: 'EMAIL_ONLY'
});


const notifyAndGo = {
  onSuccess: function(formType, result) {
    successAlert()
    Router.go('home');
  },
  onError: function(formType, error){
    failAlert(error)
  }
}

const bringBackWysiwyg = {

}

AutoForm.addHooks(['matkulEdit'], notifyAndGo);

Accounts.config({
  forbidClientAccountCreation : true
});


