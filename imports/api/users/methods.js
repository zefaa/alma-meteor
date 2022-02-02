import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Article } from '../alma-v1/db/collections-articles';
import { Documents } from '../alma-v1/db/collections-landing';
import { News } from '../alma-v1/db/collections-news';
import { Page } from '../alma-v1/db/collections-pages';
import { AppProfiles } from '../alma-v1/db/collections-profiles';
import { CoursePrograms, CourseProgramsActive } from '../coursePrograms/coursePrograms';
import { CimCurriculas } from '../alma-v1/db/collections-cimCenter';

Meteor.methods({
    'appProfiles-getLecturers'() {
      // kalau fetchnya ketinggalan, errornya hanya kelihatan di konsol cmd-nya
      return AppProfiles.find({
        profileType : 'dosen'
      },{
        sort : {
          'fullName' : 1
        }
      }).fetch();
    },
    async 'cim-checkSlug'(body) {
      check(body, Object);
      const collectionDict = [
        { code: 'articles', value: Article },
        { code: 'documents', value: Documents },
        { code: 'news', value: News },
        { code: 'pages', value: Page },
        { code: 'appProfiles', value: AppProfiles, useObjectId: true },
        { code: 'coursePrograms', value: CoursePrograms, useObjectId: true },
        { code: 'cimCurriculas', value: CimCurriculas },
      ]
      const getCollection = collectionDict.find((x) => {
        return x.code === body.code
      })
      if(getCollection){
        const query = {}
        if(body.editId && body.editId !== ''){
          let editId = body.editId
          if(getCollection.useObjectId){
            editId = new Meteor.Collection.ObjectID(editId)
          }
          query._id = { $ne: editId }
        }
        query[body.dbField] = body.slug
        const checkExists = await getCollection.value.findOne(query);
        return checkExists
      } else {
        throw Error('No collection was found!')
      }
    }
})
