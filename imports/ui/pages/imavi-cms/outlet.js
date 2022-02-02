import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Outlet } from '../../../api/alma-v1/db/collections-outlet.js';

import _ from 'underscore';

import './outlet.html';

Template.listOutlet.onCreated(function () {
    this.toogleAdd = new ReactiveVar(false);
    this.availability = new ReactiveVar(false);
    Tracker.autorun(() => {
        Meteor.subscribe("outlet", function(){
            console.log("outlet is ready");
        });
    });
})

Template.listOutlet.helpers({
    outlets(){
        return Outlet.find({}).fetch();
    },
    toogleAdd(){
        return Template.instance().toogleAdd.get();
    },
    availability(){
        return Template.instance().availability.get();
    }
});

Template.listOutlet.events({
    "click #tambah-outlet" (e,t) {  
        t.toogleAdd.set(true);
    },
    "click .cancel" (e,t){
        $('#nama-outlet').val('')
        $('#kode-outlet').val('')
        $('#desc-outlet').val('')
        t.toogleAdd.set(false);
    },
    "keyup #kode-outlet"(e,t){
        let kode = $('#kode-outlet').val();
        let listOutlet = Outlet.find().fetch();
        listOutlet = _.find(listOutlet, function (i) {  
            return i.code == kode;
        });
        t.availability.set(!listOutlet)
    },
    "click .toggle-outlet"(e,t){
        let value = $(e.target).attr('status');
        let milik = $(e.target).attr('milik');
        value = !value;
        let data = {
            'id': milik,
            'status': value
        }
        Meteor.call('toggleOutlet', data, function (err,res) {  

        });
    },
    "click .save-form"(e,t){
        let milik = e.target.value;
        let nama = $('#form-edit-name-'+milik).val();
        let kode = $('#form-edit-kode-'+milik).val();
        let desc = $('#form-edit-desc-'+milik).val();
        if(nama.length == 0){
            
        }
        if(kode.length == 0){

        }
        let listOutlet = Outlet.find().fetch();
        listOutlet = _.find(listOutlet, function (i) {  
            return i.code == kode && i._id != milik;
        });
        if(listOutlet){
            console.log('wes ada');
            return;
        }
        let data = {
            'id': milik,
            'name': nama,
            'code': kode,
            'details': desc
        }
        Meteor.call('updateOutlet', data, function (err,res) {  

        });
        $('#editform-'+milik).attr('hidden','hidden');

    },
    "click .cancel-form"(e,t){
        let value = e.target.value;
        $('#editform-'+value).attr('hidden','hidden');
    },
    "click #submit-outlet"(e,t){
        let nama = $('#nama-outlet').val();
        let kode = $('#kode-outlet').val();
        let desc = $('#desc-outlet').val();

        if(nama.length == 0){
            
        }
        if(kode.length == 0){

        }
        if(!t.availability.get()){

        }
        let data = {
            'name': nama,
            'code': kode,
            'details': desc,
            'status': true,
            'createdAt': new Date(),
            'createdBy': Meteor.userId()
        }
        Meteor.call('insertOutlet', data, function (err,res) {  

        })
        $('#nama-outlet').val('')
        $('#kode-outlet').val('')
        $('#desc-outlet').val('')
        t.toogleAdd.set(false);
    }   

});

Template.editOutlet.onCreated(function () {
    let param = Router.current().params._id;
    this.availability = new ReactiveVar(true);
    let tempOutlet = Outlet.findOne({'_id': param});
    if(!tempOutlet){
        history.back()
    }
    else{
        this.outlet = new ReactiveVar(tempOutlet);
    }
})

Template.editOutlet.helpers({
    outlet(){
        return Template.instance().outlet.get();
    },
    availability(){
        return Template.instance().availability.get();
    }
});

Template.editOutlet.events({
    "click #tambah-outlet" (e,t) {  
        t.toogleAdd.set(true);
    },
    "click .cancel" (e,t){
        history.back();
    },
    "keyup #kode-outlet"(e,t){
        let kode = $('#kode-outlet').val();
        let listOutlet = Outlet.find().fetch();
        listOutlet = _.find(listOutlet, function (i) {  
            return i.code == kode && i._id != Template.instance().outlet.get()._id;
        });
        console.log(listOutlet)
        t.availability.set(!listOutlet)
    },
    "click #submit-outlet"(e,t){
        let milik = $(e.target).attr('milik');
        let nama = $('#nama-outlet').val();
        let kode = $('#kode-outlet').val();
        let desc = $('#desc-outlet').val();

        if(nama.length == 0){
            
        }
        if(kode.length == 0){

        }
        if(!t.availability.get()){

        }
        let data = {
            'id': milik,
            'name': nama,
            'code': kode,
            'details': desc,
        }
        Meteor.call('updateOutlet', data, function (err,res) {  

        })
        history.back()
    }
});