import { Template } from 'meteor/templating';
import _ from 'underscore';
import { Outlet } from '../../../api/alma-v1/db/collections-outlet';

import './appBody.html';

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

startSelect2 = function () {
  setTimeout(() => {
    $('.select2').select2();
  }, 200)
}

openSelect2 = function () {
  setTimeout(() => {
    $('.select-items').select2('open');
  }, 500)
}

Template.navigation.events({
  'click #historyBack': function (e, t) {
    e.preventDefault();
    return history.back();
  }
});

Template.configSuper.onCreated(function(){
  this.nowLoading = new ReactiveVar(true);
  let loadingStatus = this.nowLoading;

  loadingStatus.set(false);
})

Template.configSuper.helpers({
  stillLoading() {
    return Template.instance().nowLoading.get();
  },
})

Template.configSuper.events({
  'click #migrasiAppProfiles':function(e,t) {
    enterLoading();

    Meteor.call('initiateAppProfiles', function(error, result){
        if(error){
          alert(error)
          exitLoading();
        }else{
          exitLoading();
        }
    })
  },
  'click #tempDataRun':function(e,t) {
    enterLoading();
    Meteor.call('tempDataRun', function(error, result){
        if(error){
          failAlert(error)
        }else{
          successAlert()
        }
        exitLoading();
    })
  },
  'click #alanningAdd':function(e,t) {
    enterLoading();
    Meteor.call('alanningAdd', $('#alanningRoleName').val(), function(error, result){
        if(error){
          failAlert(error)
        }else{
          successAlert('Alanning Role berhasil dibuat!')
        }
        exitLoading();
    })
  },
  // 'click #initiateRoles':function(e,t) {
  //   enterLoading();
  //   Meteor.call('initiateRoles', function(error, result){
  //       if(error){
  //         failAlert(error)
  //       }else{
  //         successAlert()
  //       }
  //       exitLoading();
  //   })
  // },
 'click #migrasiAppProfiles':function(e,t) {
   enterLoading();
   Meteor.call('initiateAppProfiles', function(error, result){
      if(error){
        failAlert(error)
      } else {
        successAlert()
      }
      exitLoading();
   })
 },
//  'click #cobaRoles':function(e,t) {
//     enterLoading();
//     Meteor.call('cobaRoles', function(error, result){
//       if(error){
//         failAlert(error)
//       } else {
//         successAlert()
//       }
//       exitLoading();
//     })
//   }
});

Template.mainUserList.onCreated(function(){
  Tracker.autorun(() => {
      Meteor.subscribe("usersList", function(){
        console.log("usersList is ready");
      });
      Meteor.subscribe("outlet", function(){
        console.log("outlet is ready");
      });
  });
});

Template.mainUserList.helpers({
  dataList(){
    return Meteor.users.find().fetch();
  },
});

Template.mainUserForm.onCreated(function(){
  this.tempRole = new ReactiveVar([])
  this.trueTempRole = new ReactiveVar([])
  this.isSuperAdmin = new ReactiveVar(false)
  this.submitType = new ReactiveVar(this.data.submitType);
  const tempOutlet = Outlet.find().fetch();
  this.outlets = new ReactiveVar(tempOutlet);
})

Template.mainUserForm.onRendered( function(){
  const context = this
  const checkOutletReady = Outlet.find({}).count()
  if(checkOutletReady > 0){
    // ini untuk roles murni tanpa parentnya
    Meteor.call('roles-list', function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        context.trueTempRole.set(result)
      }
    })
    Meteor.call('parentRoles-list', function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        const data = []
        context.tempRole.set(result)
        result.forEach(element => {
          data.push({
            id: element.name,
            text: element.name
          })
        });
        $('#parent-roles').select2({
          width: '100%',
          data
        });
        if(context.submitType.get() === 2){
          const _id = Router.current().params._id;
          const getUser = Meteor.users.findOne({
            _id
          });
          if(getUser){
            $('#inputName').val(getUser.fullname);
            $('#inputEmail').val(getUser.emails[0].address);
            const idList = []
            getUser.roles.forEach(element => {
              const checkExists = _.find(data, function(role){
                 return role.id === element._id
              });
              if(checkExists){
                idList.push(element._id)
              }
              if(element._id === 'superadmin'){
                $('#is-superadmin').prop('checked', true)
                context.isSuperAdmin.set(true)
              }
            });
            $('#parent-roles').val(idList).trigger('change');
            context.outlets.get().forEach(element => {
              if(getUser.outlets && getUser.outlets.includes(element.code)){
                  $("#outlet-" + element.code).prop("checked", true);
              }
              else $("#outlet-" + element.code).prop("checked", false);
            });
          } else {
            history.back()
          }
        }
      }
    });
  } else {
    history.back()
  }
})

Template.mainUserForm.helpers({
  tempRole(parent){
    const tempRoleList = Template.instance().tempRole.get()
    const result = _.filter(tempRoleList, function(element){
       return element.parent === parent; 
    });
    return result
  },
  isSuperAdmin(){
    return Template.instance().isSuperAdmin.get()
  },
  outlets(){
    let outlet = Outlet.find({}).fetch();
    return outlet;
  },
});

Template.mainUserForm.events({
  'change #is-superadmin': function (event, template) {
    template.isSuperAdmin.set($('#is-superadmin').prop('checked'))
    if(!$('#is-superadmin').prop('checked')){
      $('#parent-roles').val([]).trigger('change');
    }
  },
  'click #submit-data': function (event, template) {
    event.preventDefault();
    const fullname = $('#inputName').val();
    const email = $('#inputEmail').val();
    let roles = $('#parent-roles').val()
    if(template.isSuperAdmin.get()){
      roles = ['superadmin']
      template.trueTempRole.get().forEach(element => {
        roles.push(element.code)
      });
    }
    const body = {
      fullname,
      email,
      roles
    }

    const outlets = [];
    template.outlets.get().forEach(element => {
      // console.log('#outlet-' + element.code)
      if($('#outlet-' + element.code).prop('checked') === true){
        outlets.push(element.code)
      }
    });
    body.outlets = outlets
    
    const submitType = template.submitType.get();
    let postRoute = 'createUserMain';
    if (submitType === 2) {
      postRoute = 'editUserMain';
      body._id = Router.current().params._id;
    }
    Meteor.call(postRoute, body, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        if (submitType === 2) {
          successAlertBack()
        } else {
          $('input').val('');
          successAlert()
        }
      }
    });
  }
});

Template.roleList.onCreated(function(){
  this.dataList = new ReactiveVar([])
  const self = this
  Meteor.call('parentRoles-list', function (error, result) {
    if (error) {
      failAlert(error)
    } else {
      self.dataList.set(result)
    }
  });
});

Template.roleList.helpers({
  dataList(){
    return Template.instance().dataList.get();
  },
});

Template.roleForm.onCreated(function(){
  this.tempRole = new ReactiveVar([])
  this.dataDetail = new ReactiveVar({})
  this.submitType = new ReactiveVar(this.data.submitType);
})

Template.roleForm.onRendered( function(){
  const context = this
  Meteor.call('getTempRoles', function (error, result) {
    if (error) {
      failAlert(error)
    } else {
      result.forEach(element => {
        element.checked = false
      });
      context.tempRole.set(result)
      if(context.submitType.get() === 2){
        const _id = Router.current().params._id;
        Meteor.call('parentRoles-detail', _id, function (error, result) {
          if (error) {
            failAlert(error)
          } else {
            $('#inputName').val(result.name);
            const tempRole = context.tempRole.get()
            tempRole.forEach(role => {
              const findRole = _.find(result.roles, function(element){
                return element === role.code; 
              })
              if(findRole){
                role.checked = true
              }
            });
            context.tempRole.set(tempRole)
            context.dataDetail.set(result)
          }
        });
      }
    }
  });
})

Template.roleForm.helpers({
  tempRole(parent){
    const tempRoleList = Template.instance().tempRole.get()
    const result = _.filter(tempRoleList, function(element){
       return element.parent === parent; 
    });
    return result
  }
});

Template.roleForm.events({
  'click #submit-data': function (event, template) {
    event.preventDefault();
    const dataDetail = template.dataDetail.get()
    const name = $('#inputName').val();
    const roles = []
    const tempRoles = template.tempRole.get()
    const body = {
      name
    }
    tempRoles.forEach(element => {
      if($('#' + element.code).prop('checked') === true){
        roles.push(element.code)
      }
    });
    body.roles = roles
    
    const submitType = template.submitType.get();
    let postRoute = 'parentRoles-create';
    if (submitType === 2) {
      postRoute = 'parentRoles-edit';
      body._id = Router.current().params._id;
      body.prevName = dataDetail.name
    }
    Meteor.call(postRoute, body, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlertBack()
      }
    });
  }
});
