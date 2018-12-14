import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { Sessions } from '../api/sessions.js'
// import { Sessionsa } from '../api/sessions.1.js';
import { Tasks } from '../api/tasks.js'
import { Assessments } from '../api/assessments.js'

import TasksCmp from './Tasks.jsx'
import SessionManager from './SessionManager.jsx'

class TaskAssessment extends Component {
  render() {
    return (
      <div>
        <h1>{this.props.task.text}</h1>
        <button onClick={this.props.onImportant}>
          {this.props.urgency ? 'Urgent' : 'Important'}
        </button>
        <button onClick={this.props.onNotImportant}>
          {this.props.urgency ? 'Not urgent' : 'Not important'}
        </button>
      </div>
    )
  }
}

class TasksAssessment extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTask: 0,
    }
  }

  currentTask() {
    return this.props.tasks[this.state.currentTask]
  }

  handleImportant() {
    Meteor.call(
      'assessments.insert',
      this.currentTask()._id,
      this.props.urgency ? { urgent: true } : { important: true }
    )
    this.setState({ currentTask: this.state.currentTask + 1 })
  }

  handleNotImportant() {
    Meteor.call(
      'assessments.insert',
      this.currentTask()._id,
      this.props.urgency ? { urgent: false } : { important: false }
    )
    this.setState({ currentTask: this.state.currentTask + 1 })
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        {this.props.tasks[this.state.currentTask] ? (
          <TaskAssessment
            onImportant={this.handleImportant.bind(this)}
            onNotImportant={this.handleNotImportant.bind(this)}
            task={this.currentTask()}
            urgency={this.props.urgency}
          />
        ) : (
          <h1>You are all done!</h1>
        )}
      </div>
    )
  }
}

const Step = props => {
  switch (props.session.step) {
    case 0:
      return <TasksCmp />
    case 1:
      return <TasksAssessment tasks={props.tasks} key={1} />
    case 2:
      return <TasksAssessment tasks={props.tasks} urgency key={2} />
    case 3:
      return <Matrix tasks={props.tasks} assessments={props.assessments} />
    default:
      return <TasksCmp />
  }
}

function average(task, allAssessments, urgency = false) {
  const assessments = allAssessments.filter(
    a =>
      a.taskId === task._id &&
      (urgency ? a.important === null : a.urgent === null)
  )
  const length = assessments.length
  const sum = assessments.reduce(
    (sum, a) => (a[urgency ? 'urgent' : 'important'] ? sum + 1 : sum),
    0
  )
  const result = sum / length
  return result
}

const groupTasks = (tasks, assessments, urgency) =>
  tasks.reduce((obj, task) => {
    const key = 1 - Math.floor(average(task, assessments, urgency) * 8) / 8
    if (!obj[key]) obj[key] = []
    obj[key].push(task)
    return obj
  }, {})

const Matrix = ({ tasks, assessments }) => {
  const grouped = groupTasks(tasks, assessments)
  const urgent = groupTasks(tasks, assessments, true)

  return (
    <div className="matrix">
      <div
        style={{
          width: '80%',
          height: '600px',
          margin: '20px auto',
          position: 'relative',
        }}
      >
        {Object.keys(grouped).map(left =>
          Object.keys(urgent).map(top => (
            <div
              className="task-group"
              style={{
                position: 'absolute',
                left: `${Number(top) * 100}%`,
                top: `${Number(left) * 100}%`,
              }}
            >
              {grouped[left].map(
                task =>
                  urgent[top].indexOf(task) !== -1 && (
                    <div className="task">{task.text}</div>
                  )
              )}
            </div>
          ))
        )}
        <div className="urgent-label">Urgent</div>
        <div className="not-urgent-label">Not urgent</div>
        <div className="important-label">Important</div>
        <div className="not-important-label">Not important</div>
      </div>
    </div>
  )
}

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hideCompleted: false,
    }
  }

  handleAdvance() {
    Meteor.call('sessions.advance', this.props.session._id)
  }

  handleBack() {
    Meteor.call('sessions.back', this.props.session._id)
  }

  step() {}

  render() {
    return (
      <div>
        {this.props.session ? <Step {...this.props} /> : <div>Loading...</div>}
        {location.hash === '#admin' && (
          <div>
            <button onClick={this.handleAdvance.bind(this)}>
              Advance session
            </button>
            <button onClick={this.handleBack.bind(this)}>Back session</button>
            <SessionManager />
          </div>
        )}
      </div>
    )
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
}

export default createContainer(() => {
  Meteor.subscribe('tasks')
  Meteor.subscribe('assessments')
  Meteor.subscribe('sessions')

  return {
    session: Sessions.find(
      { active: true },
      { sort: { createdAt: -1 } }
    ).fetch()[0],
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    assessments: Assessments.find({}, { sort: { createdAt: -1 } }).fetch(),
  }
}, App)
