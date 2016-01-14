'use babel';

import {minutesToMilliseconds} from './time-helpers'

export default {
  intervalId: null,
  wasDay: null,

  activate() {
    let milliseconds = minutesToMilliseconds(this.getCheckIntervalInMinutes())
    this.intervalId = setInterval(this.changeTheme.bind(this), milliseconds)
    this.changeTheme()
  },

  deactivate() {
    clearInterval(this.intervalId)
    this.intervalId = null
  },

  changeTheme() {
    let isDay = this.isDay()
    if (isDay === this.wasDay) return

    if (isDay) {
      atom.config.set('core.themes', ['one-light-ui', 'one-light-syntax'])
    } else {
      atom.config.set('core.themes', ['one-dark-ui', 'one-dark-syntax'])
    }

    this.wasDay = isDay
  },

  isDay() {
    let hours = new Date(Date.now()).getHours()
    return hours >= 7 && hours <= 17
  },

  getCheckIntervalInMinutes() {
    return 15
  }
};
