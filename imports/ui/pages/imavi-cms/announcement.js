import './announcement.html'

Template.formAnnouncement.onCreated(function (){
    this.editor = new ReactiveVar();
});
Template.formAnnouncement.onRendered(function () {
    initEditor(Template.instance())
});
Template.formAnnouncement.events({
    "click #submit"(e, t){

    },
});