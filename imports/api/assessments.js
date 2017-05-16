import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Assessments = new Mongo.Collection('assessments');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('assessments', function tasksPublication() {
    return Assessments.find({});
  });
}

Meteor.methods({
  'assessments.insert'(taskId, assessment) {
    Assessments.insert({
      taskId: taskId,
      important: assessment.important,
      urgent: assessment.urgent,
      createdAt: new Date(),
    });
  },
});
