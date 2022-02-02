import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';
import textareaAutoSize from 'textarea-autosize';


import { ScoreSheets } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItemGroups } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItems } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringTemplates } from '../../../api/alma-v1/db/collections-assessment.js';
import { ItemAnswers } from '../../../api/alma-v1/db/collections-assessment.js';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';


import { saDict } from '../../../api/alma-v1/db/dict-assessment.js';
import { sagDict } from '../../../api/alma-v1/db/dict-assessment.js';
import { fbDict } from '../../../api/alma-v1/db/dict-assessment.js';


// import '../main.html';
// import './sheets.html';

SimpleSchema.debug = true;

function enterLoading() {
  $('body').toggleClass('loading');
  $('button').attr("disabled", true);
}

function getGid(formItem){
  let itemId = formItem.name;
  return itemId.slice(0,1);
}

const arr = new ReactiveArray([
]);


