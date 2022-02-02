
import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import _, { result } from 'underscore';
const arr = new ReactiveArray([
]);

import './participant.html';
import { AppProfiles } from '../../../api/alma-v1/db/collections-profiles';
import { IvanTeams } from '../../../api/alma-v1/db/collections-cimCenter';

  function startSelect2() {
    setTimeout(() => {
      $('.select2').select2();
    }, 100)
  };

  Template.participantsList.onCreated(function(){
      this.curriculumForm = new ReactiveVar(false);
      this.dataList = new ReactiveVar();
      this.dataTanyaIvan = new ReactiveVar();
      this.dataDefault = new ReactiveVar();
      Tracker.autorun(() => {
          Meteor.subscribe("getAllProfiles", function(){
            console.log("profile is ready");
          });
          Meteor.subscribe("getIvanTeams", function(){
            console.log("ivan teams is ready");
          });
      });
      const context = this;
      Meteor.call('getCimParticipants', function(error, result){
        if(result){
          context.dataDefault.set(result);
          const temp = _.filter(result, function(data){
            return data.roles.includes('cimStudent')
          })
          context.dataList.set(temp);
        }
      });
  });

  Template.participantsList.helpers({
      dataList(){
        return Template.instance().dataList.get();
      },
      userRole (){
        return Roles.getRolesForUser( this._id );
      },
      nowListing(){
        return Template.instance().nowListing.get();
      },
      searchOn(){
        return Template.instance().searchOn.get();
      },
  });

  Template.participantsList.events({
      'click #toggle-curriculum-form': function (event, template) {
        event.preventDefault();
        template.curriculumForm.set( !template.curriculumForm.get());
      },
      'click #peserta-cim' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('cimStudent')
        })
        Template.instance().dataList.set(temp);
      },
      'click #user-ti' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('tiPenjawab') || data.roles.includes('tiEditor') ||
                data.roles.includes('tiAdmin')
        })
        Template.instance().dataList.set(temp);
      },
      'click #user-cim-cms' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('articleWriter') || data.roles.includes('articleEditor') ||
                  data.roles.includes('articleAdmin') || data.roles.includes('newsWriter') || 
                  data.roles.includes('newsEditor') || data.roles.includes('newsAdmin')
        })
        Template.instance().dataList.set(temp);
      }
  });

  Template.registrationList.onCreated(function(){
    this.curriculumForm = new ReactiveVar(false);
    this.dataList = new ReactiveVar();
    this.dataTanyaIvan = new ReactiveVar();
    this.dataDefault = new ReactiveVar();
    const context = this;
    const dataWithoutStatus = []
    Meteor.call('getRegistrationRequests', function(error, result){
        _.each(result, function(x,i){
          if (!x.status){
            const id = x._id
            x._id = id+""
            dataWithoutStatus.push(x)
          }      
        })      
        context.dataDefault.set(result);    
        context.dataList.set(dataWithoutStatus);    
    });
});

  Template.registrationList.helpers({
      dataList(){
        return Template.instance().dataList.get();
      },
      userRole (){
        return Roles.getRolesForUser( this._id );
      },
      nowListing(){
        return Template.instance().nowListing.get();
      },
      searchOn(){
        return Template.instance().searchOn.get();
      },
  });

  Template.registrationList.events({
      'click #toggle-curriculum-form': function (event, template) {
        event.preventDefault();
        template.curriculumForm.set( !template.curriculumForm.get());
      },
      'click #peserta-cim' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('cimStudent')
        })
        Template.instance().dataList.set(temp);
      },
      'click #user-ti' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('tiPenjawab') || data.roles.includes('tiEditor') ||
                data.roles.includes('tiAdmin')
        })
        Template.instance().dataList.set(temp);
      },
      'click #user-cim-cms' : function ( event, template ) {
        event.preventDefault();
        let temp = Template.instance().dataDefault.get();
        temp = _.filter(temp, function(data){
          return data.roles.includes('articleWriter') || data.roles.includes('articleEditor') ||
                  data.roles.includes('articleAdmin') || data.roles.includes('newsWriter') || 
                  data.roles.includes('newsEditor') || data.roles.includes('newsAdmin')
        })
        Template.instance().dataList.set(temp);
      }
  });

  Template.registrationNew.onCreated( function(){
    this.acp = new ReactiveVar([])
    this.dioceses = new ReactiveVar([])
    this.parokis = new ReactiveVar([])
    const context = this
    Meteor.call('getAllAcp', function(error, result) {
      _.each(result, function(x,i){
        const id = x._id+""
        $('<div />',{ 'id': 'acp'+i }).appendTo($('#checkboxGroup'))
        $('<input />', { 'type': 'checkbox','name': 'checkbox','placeholder':'checkbox' ,'id': id, 'value': id }).appendTo($('#acp'+i));
        $('<label />', { 'for': id, 'text': x.name, 'style':'margin-left:1vh' }).appendTo($('#acp'+i));
      })    
      context.acp.set(result)
    })
    Meteor.call('getAllDioceses',function (error, result){  
      context.dioceses.set(result)
    })
  })
  Template.registrationNew.helpers({
    // selectTypeUser(){
    //   return Template.instance().selectTypeUser.get();
    // },
    dioceses() {
      return Template.instance().dioceses.get();
    },
    parokis() {
      return Template.instance().parokis.get();
    },
    acp() {
      return Template.instance().acp.get();
    },
    // selectedAcp(){
    //   return Template.instance().selectedAcp.get();
    // }
  })

  Template.registrationNew.events({
    'change #selectDioceses' : function (e, t){
      const _id = $('#selectDioceses').find(":selected").val()
      Meteor.call('getParoki', _id, function (error, result){  
        t.parokis.set(result)
      })
      $("#selectDioceses option[value='']").remove();
    },
    'click #addRegistration' : function (e,t){
      e.preventDefault()
      const acp = t.acp.get()
      const input = {}
      const acpList = []
      const acpIdList = []
      _.each(acp, function(x,i){   
        const id = x._id+""
        if ( $("#" + id).prop('checked')){
          const body = {
            psId: x.psId,
            psName: x.psName,
            cpId: x.cpId,
            cpName: x.cpName,
            acpId: x._id + '',
            acpName: x.name,
            curriculaId: x.curriculaId,
            curriculaName: x.curriculaName
          } 
          acpList.push(body)
          acpIdList.push(x._id+"")
        }      
      })

      input.acp = acpList
      const outlets = []
      const roles = ['cimStudent']
      const studentNumber = $('#noPeserta').val();
      const letterFile = $('#letterFile').prop('files');
      const paymentFile = $('#paymentFile').prop('files');
      const fullName = $('#inputName').val();
      const baptistName = $('#baptistName').val();
      const address = $('#address').val();
      const keuskupanName = $('#selectDioceses').find(":selected").text();
      const parokiName = $('#selectParokis').find(":selected").text();
      const lingkungan = $('#lingkungan').val();
      const callName = $('#callName').val();
      const dob = $('#inputDob').val();
      const phoneNumber = $('#whatsapp').val();
      const email = $('#inputEmail').val();
      const keuskupanId = $('#selectDioceses').find(":selected").val()
      const parokiId = $('#selectParokis').find(":selected").val()
      const password = email
      const registrationRequest = {
        fullName,
        dob,
        email,
        password,
        phoneNumber,
        baptistName,
        callName,
        keuskupanId,
        keuskupanName,
        lingkungan,
        parokiId,
        parokiName,
        address,
        status: 80,
        acp: acpIdList,
      }

      input.paymentFile = paymentFile[0]
      input.letterFile = letterFile[0]

      const newUser = {
        studentNumber,
        fullName,
        dob,
        email,
        password,
        phoneNumber,
        outlets,
        roles,
        baptistName,
        callName,
        keuskupanId,
        keuskupanName,
        lingkungan,
        parokiId,
        parokiName,
        address
      }
      input.registrationRequest = registrationRequest
      input.newUser = newUser
      Meteor.call('registration-confirmation', input, function (err,result){
        if(err){
          failAlert(err)
        } else {
          const id = result+""
          if (typeof paymentFile[0] !== 'undefined'){
            uploadImageFile(id, paymentFile[0],'payments')
          }
          if (typeof letterFile[0] !== 'undefined'){
            uploadImageFile(id, letterFile[0], 'letters')
          }
          successAlert("Berhasil Menambahkan User")
          Router.go('/cim/participant/registration');  
        }
      })
    },
    'change #letterFile' : function(e,t){
      const file = e.target.files[0]
      if (file){
        const reader = new FileReader()
        reader.addEventListener('load', function() {
          console.log(this)
          $('#letterImage').attr('src',this.result)
        });
        reader.readAsDataURL(file);
      }
      else{
        $('#letterImage').attr('src','#')
      }
    },
    'change #paymentFile' : function (e,t){
      const file = e.target.files[0]
      if (file){
        const reader = new FileReader()
        reader.addEventListener('load', function() {
          console.log(this)
          $('#paymentImage').attr('src',this.result)
        });
        reader.readAsDataURL(file);
      }
      else{
        $('#paymentImage').attr('src','#')
      }
    }
  })
  Template.registrationEdit.onRendered( function(){
    const _id = Router.current().params._id
    this.acp = new ReactiveVar([])
    this.selectedAcp = new ReactiveVar([])
    const context = this
    getFireImage('letters/'+Router.current().params._id, 'letter')
    getFireImage('payments/'+Router.current().params._id, 'payment')
    Meteor.call('getAllAcp', function(error, result) {
      _.each(result, function(x,i){
        const id = x._id+""
        $('<div />',{ 'id': 'acp'+i }).appendTo($('#checkboxGroup'))
        $('<input />', { 'type': 'checkbox','name': 'checkbox','placeholder':'checkbox' ,'id': id, 'value': id }).appendTo($('#acp'+i));
        $('<label />', { 'for': id, 'text': x.name, 'style':'margin-left:1vh' }).appendTo($('#acp'+i));
      })    
      context.acp.set(result)
      context.selectedAcp.set(result)
    })

    Meteor.call('getDetailRegistrationRequest', _id,function(error, result) {
      _.each(result.acp, function(x,i){  
        $("#" + x).prop('checked', true);
      })    
      result.dob = new moment(result.dob).format("YYYY-MM-DD")
      $('#inputName').val(result.fullName);
      $('#baptistName').val(result.baptistName);
      $('#address').val(result.address);
      $('#keuskupan').val(result.keuskupanName);
      $('#paroki').val(result.parokiName);
      $('#lingkungan').val(result.lingkungan);
      $('#callName').val(result.callName);
      $('#inputDob').val(result.dob);
      $('#whatsapp').val(result.phoneNumber);
      $('#inputEmail').val(result.email);
      $('#inputPhone').val(result.phoneNumber);
      $('#inputNumber').val(result.studentNumber);
      if(checkValid(result.profileId)){
        const profileId = new Meteor.Collection.ObjectID(result.profileId)
        Meteor.call('getAppProfile',profileId,function (err,result){
          if(err){
            failAlert(err)
          } else {
            $('#noPeserta').val(result.studentNumber);
          }
        })
      }
      context.acp.set(result)
    })
  });

  Template.registrationEdit.helpers({
    selectTypeUser(){
      return Template.instance().selectTypeUser.get();
    },
    ivanTeams() {
      return IvanTeams.find({}).fetch();
    },
    userInIvanTeams() {
      return arr.array();
    },
    acp() {
      return Template.instance().acp.get();
    },
    selectedAcp(){
      return Template.instance().selectedAcp.get();
    }
  })

  Template.registrationEdit.events({
    'click #confirm': function(e, t ) {
        e.preventDefault();
        const requests = Template.instance().acp.get()
        console.log(requests)
        const selectedAcp = t.selectedAcp.get()
        const acpList = []
        _.each(selectedAcp, function(x,i){   
          const id = x._id+""
          if ( $("#" + id).prop('checked')){
            acpList.push(x)
          }      
        })
        const input = {}
        input._id = Router.current().params._id
        const arrAcp = []
        if (checkValid(requests.profileId)){
          _.each(acpList, function(x){
            const body = {
              profileId: requests.profileId,
              fullName: requests.fullName,
              email: requests.email,
              psId: x.psId,
              psName: x.psName,
              cpId: x.cpId,
              cpName: x.cpName,
              acpId: x._id+"",
              acpName: x.name,
              curriculaId: x.curriculaId,
              curriculaName: x.curriculaName
            } 
            arrAcp.push(body)
          })
          input.acp = arrAcp
          input.status = 80
        } else {
          const fullName = requests.fullName;
          const dob = requests.dob
          const email = requests.email;
          const password  = requests.email;
          const phoneNumber = requests.phoneNumber;
          const studentNumber = $('#noPeserta').val();
          const roles = ['cimStudent']
          const outlets = [];
          const baptistName = requests.baptistName
          const callName = requests.callName
          const keuskupanId = requests.keuskupanId
          const keuskupanName = requests.keuskupanName
          const lingkungan = requests.lingkungan
          const parokiId = requests.parokiId
          const parokiName = requests.parokiName
          const address = requests.address
          const newUser = {
            fullName,
            dob,
            email,
            password,
            phoneNumber,
            studentNumber,
            outlets,
            roles,
            baptistName,
            callName,
            keuskupanId,
            keuskupanName,
            lingkungan,
            parokiId,
            parokiName,
            address
          }
          input.newUser = newUser
          _.each(acpList, function(x){
            const body = {
              psId: x.psId,
              psName: x.psName,
              cpId: x.cpId,
              cpName: x.cpName,
              acpId: x._id + '',
              acpName: x.name,
              curriculaId: x.curriculaId,
              curriculaName: x.curriculaName
            } 
            arrAcp.push(body)
          })
          input.acp = arrAcp
          input.status = 80
        }
        // console.log(input)
        Meteor.call('registration-confirmation', input, function (err,result){
          if(err){
            failAlert(err)
          } else {
            successAlert("Berhasil Mendaftarkan Kursus") 
            Router.go('/cim/participant/registration');  
          }
        })
      },
      'click #decline': function(e, t ) {
        e.preventDefault();
        const _id = Router.current().params._id
        const status = 99
        Meteor.call('registration-update',_id, status, function (error,result){
          if (error) {
            failAlert(error)
          } else {
            successAlert('Peserta kursus berhasil ditambahkan')
          }
        })
        Router.go('/cim/participant/registration');
      }
  });
  Template.participantsForm.onCreated( function(){
      arr.clear();
      startSelect2();
      this.submitType = new ReactiveVar(this.data.submitType);
      this.outlets = new ReactiveVar([])
      const self = this
      Meteor.call('getAllOutlets', function(error, result) {
        if(result){
          self.outlets.set(result)
        }else{
          failAlert(error)
        }
      })
      if(!IvanTeams.find({}).fetch() || IvanTeams.find({}).fetch().length === 0){
        history.back()
      }
  });

  Template.participantsForm.onRendered( function(){
    if(this.submitType.get() === 2){
      const id = Router.current().params._id;
      const objectId = new Meteor.Collection.ObjectID(id);
      const getProfile = AppProfiles.findOne({
        _id : objectId,
      });
      if(getProfile){
        Meteor.call('getAppUser', id, function(error, result){
          if(result){
            $('#inputName').val(getProfile.fullName);
            $('#inputDob').val(getProfile.dob);
            $('#inputEmail').val(result.email);
            $('#inputPhone').val(getProfile.phoneNumber);
            $('#inputNumber').val(getProfile.studentNumber);
            $('#selectPeranUser').val(result.roles);
            $('#selectOutlets').val(result.outlets);
            
            //team ivan list
            const idTeamIvan = [];
            _.each(result.teamList, function (x) {
              idTeamIvan.push(x._id);
            })
            $('#selectIvanTeams').val(idTeamIvan)
          }
        })
      }
    }
  });

  Template.participantsForm.helpers({
    selectTypeUser(){
      return Template.instance().selectTypeUser.get();
    },
    ivanTeams() {
      return IvanTeams.find({}).fetch();
    },
    userInIvanTeams() {
      return arr.array();
    },
    outlets() {
      return Template.instance().outlets.get();
    },
  })

  Template.participantsForm.events({
    'click #createUser': function(e, t ) {
        e.preventDefault();
        const fullName = $('#inputName').val();
        const dob = $('#inputDob').val();
        const email = $('#inputEmail').val();
        const password  = $('#inputPassword').val();
        const phoneNumber = $('#inputPhone').val();
        const studentNumber = $('#inputNumber').val();
        const roles = $('#selectPeranUser').val();
        const ivanTeams = $('#selectIvanTeams').val();
        const outlets = $('#selectOutlets').val();
        const dataTeams = [];
        if (t.submitType.get() === 1 && password.length < 8) {
          failAlert('Password Kurang dari 8 karakter')
        }else{
            const submitType = t.submitType.get();
            let postRoute = "participantCreate";
            const body = {
                fullName,
                dob,
                email,
                password,
                phoneNumber,
                studentNumber,
                outlets,
                roles
            }
            _.each(ivanTeams, function(x) {
              const objectId = new Mongo.Collection.ObjectID(x);
              const tempIvanTeams = IvanTeams.findOne({
                _id : objectId
              });
              const data = {
                _id : x,
                name : tempIvanTeams.name
              };
              dataTeams.push(data);
            })
            body.teamList = dataTeams;
            if (submitType === 2) {
                postRoute = 'participantEdit';
                body._id = Router.current().params._id;
            }
            Meteor.call(postRoute, body, function(error, result) {
                if(result){
                  successAlertBack('Data berhasil disimpan');
                }else{
                  failAlert(error)
                }
            })
        }
    },
    'change #selectTipeUser' : function (e, t) {
      const data = $('#selectTipeUser').val();
      Template.instance().selectTypeUser.set(data);
      startSelect2();
    }
  });
