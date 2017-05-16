import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Sessions = new Mongo.Collection('sessions');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('sessions', function tasksPublication() {
    return Sessions.find({});
  });
}

Meteor.methods({
  'sessions.insert'() {
    Sessions.update({}, { $set: { active: false }}, { multi: true })
    Sessions.insert({
      step: 0,
      active: true,
      createdAt: new Date(),
    });
  },
  'sessions.advance'(sessionId) {
    check(sessionId, String);

    const session = Sessions.findOne(sessionId);

    Sessions.update(sessionId, { $set: { step: session.step + 1 } });
  },
  'sessions.back'(sessionId) {
    check(sessionId, String);

    const session = Sessions.findOne(sessionId);

    Sessions.update(sessionId, { $set: { step: session.step - 1 } });
  },
  'sessions.activate'(sessionId) {
    check(sessionId, String);
    Sessions.update({}, { $set: { active: false }}, { multi: true })
    const session = Sessions.findOne(sessionId);

    Sessions.update(sessionId, { $set: { active: true } });
  },
});
