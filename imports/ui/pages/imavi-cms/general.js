import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';



import SimpleSchema from 'simpl-schema';
import _ from 'underscore';

import './general.html';
import { General } from '../../../api/alma-v1/db/collections-general'
Template.listGeneral.onCreated(function () {
    Tracker.autorun(() => {
        Meteor.subscribe("general", function(){
        //   console.log("answers is ready");
        });
    });
    this.general = new ReactiveVar();
    // this.outlets = new ReactiveVar();
})
Template.listGeneral.helpers({
    general(){
        let general = General.find({}).fetch();
        Template.instance().general.set(general);
        console.log(general)
        return general;
    },
});


Template.createGeneral.onCreated(function () {
    const self = this;
    this.availability = new ReactiveVar(false);
    let subs = [{
        id: 1,
        status: true
    }]
    this.subs = new ReactiveVar(subs)
    Tracker.autorun(() => {
        Meteor.subscribe("general", function(){
        //   console.log("answers is ready");
        });
        // Meteor.subscribe("scoringItemsList", function(){
        // //   console.log("scoringItemsList is ready");
        // });
    });

})

Template.createGeneral.helpers({
    subs(){
        return Template.instance().subs.get();
    },
    availability(){
        return Template.instance().availability.get();
    }

});

Template.createGeneral.events({
    "click .tambah-subs" (e,t) {
        let elem = t.subs.get();
        let newid = elem.length+1;
        // console.log(elem);
        elem.push({
            id:newid,
            status: true
        });
        console.log(elem);
        t.subs.set(elem);
    },
    "click .cancel" (e,t){
        history.back();
    },
    "keyup #code"(e,t){
        let kode = $('#code').val();
        let listgeneral = General.find().fetch();
        listgeneral = _.find(listgeneral, function (i) {
            return i.code == kode;
        });
        console.log(listgeneral)
        t.availability.set(!listgeneral)
    },
    "click .delete-subs"(e,t){
        let milik = $(e.target).attr('milik');
        // console.log(value);
        console.log('milik = '+milik);
        let elem = t.subs.get();
        elem[milik-1].status = false;
        console.log(elem);
        t.subs.set(elem);
    },
    "click #insert"(e,t){
        // let milik = e.target.value;
        let title = $('#title').val();
        let kode = $('#code').val();
        let value = $('#value').val();

        if(title.length == 0){

        }
        if(kode.length == 0){

        }
        if(value.length == 0){

        }
        if(!t.availability.get()){
            console.log('wes ada');
            // return;
        }
        let insertsubs = [];
        let subs = t.subs.get();
        subs.forEach(element => {
            if(element.status){
                let temp = {
                    'title': $('#title-'+element.id).val(),
                    'value': $('#value-'+element.id).val(),
                    'value2': $('#value2-'+element.id).val()
                }
                insertsubs.push(temp);
            }
        });
        if(insertsubs.length == 0){

        }
        let data = {
            'title': title,
            'code': kode,
            'value': value,
            'subs': insertsubs,
            'status': true,
            'createdBy': Meteor.userId(),
            'createdAt': new Date()
        }
        console.log(data);
        Meteor.call('insertGeneral', data, function (err,res) {

        });
        history.back();

    }
});

Template.editGeneral.onCreated(function () {
    const self = this;
    this.availability = new ReactiveVar(true);
    let param = Router.current().params._id;
    let tempgeneral = General.findOne({_id: param});
    if(tempgeneral){
        this.general = new ReactiveVar(tempgeneral);
        let arrsubs = [];
        let tempsubs = tempgeneral.subs;
        let nomer = 1;
        tempsubs.forEach(element => {
            let temp = {
                'id': nomer++,
                'status': true,
                'title': element.title,
                'value': element.value,
                'value2': element.value2
            }
            arrsubs.push(temp);
        });
        this.subs = new ReactiveVar(arrsubs);
    }
    else{
        history.back();
    }
})

Template.editGeneral.helpers({
    subs(){
        return Template.instance().subs.get();
    },
    general(){
        return Template.instance().general.get();
    },
    availability(){
        return Template.instance().availability.get();
    }

});

Template.editGeneral.events({
    "click .tambah-subs" (e,t) {
        let elem = t.subs.get();
        let newid = elem.length+1;
        // console.log(elem);
        elem.push({
            id:newid,
            status: true
        });
        console.log(elem);
        t.subs.set(elem);
    },
    "click .cancel" (e,t){
        history.back();
    },
    "keyup #code"(e,t){
        let kode = $('#code').val();
        let general = t.general.get();
        let listgeneral = General.find().fetch();
        listgeneral = _.find(listgeneral, function (i) {
            return i.code == kode && i._id != general._id;
        });
        console.log(listgeneral)
        t.availability.set(!listgeneral)
    },
    "click .delete-subs"(e,t){
        let milik = $(e.target).attr('milik');
        // console.log(value);
        console.log('milik = '+milik);
        let elem = t.subs.get();
        elem[milik-1].status = false;
        console.log(elem);
        t.subs.set(elem);
    },
    "click #save"(e,t){
        let milik = $(e.target).attr('milik');
        let title = $('#title').val();
        let kode = $('#code').val();
        let value = $('#value').val();

        if(title.length == 0){

        }
        if(kode.length == 0){

        }
        if(value.length == 0){

        }
        if(!t.availability.get()){
            console.log('wes ada');
            // return;
        }
        let insertsubs = [];
        let subs = t.subs.get();
        subs.forEach(element => {
            if(element.status){
                let temp = {
                    'title': $('#title-'+element.id).val(),
                    'value': $('#value-'+element.id).val(),
                    'value2': $('#value2-'+element.id).val()
                }
                insertsubs.push(temp);
            }
        });
        console.log(subs)
        if(insertsubs.length == 0){

        }
        let data = {
            'id': milik,
            'title': title,
            'code': kode,
            'value': value,
            'subs': insertsubs
        }
        console.log(data);
        Meteor.call('updateGeneral', data, function (err,res) {

        });
        history.back();

    },
    "click .cancel-form"(e,t){
        let value = e.target.value;
        // console.log(value);
        $('#editform-'+value).attr('hidden','hidden');
        // let value = $(e.target).attr('status');
        // let milik = $(e.target).attr('milik');
        // console.log(value);
        // console.log(milik);
    }

});

