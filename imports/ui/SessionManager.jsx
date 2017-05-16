import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Sessions } from '../api/sessions.js';

class SessionManager extends Component {
  constructor(props) {
    super(props);
  }

  handleCreateNewSession() {
    Meteor.call('sessions.insert');
  }

  activateSession(id) {
    Meteor.call('sessions.activate', id);
  }

  render() {
    return (
      <div>
        {this.props.sessions.map(session => <div>
          {session.active ? "Active" : "Inactive"}
          {session.createdAt.toString()}
          <button onClick={this.activateSession.bind(this, session._id)}>Activate</button>
        </div>)}
        <button onClick={this.handleCreateNewSession.bind(this)}>Create new session</button>
      </div>
    );
  }
}

SessionManager.propTypes = {
  sessions: PropTypes.array.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('sessions');

  return {
    sessions: Sessions.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, SessionManager);
