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
      this.scheduleThemeUpdate(['one-light-ui', 'one-light-syntax'])
    } else {
      this.scheduleThemeUpdate(['one-dark-ui', 'one-dark-syntax'])
    }

    this.wasDay = isDay
  },

  scheduleThemeUpdate(themes) {
    setTimeout(() => atom.config.set('core.themes', themes), 100)
  },

  isDay() {
    let hours = new Date(Date.now()).getHours()
    return hours >= 7 && hours <= 17
  },

  getCheckIntervalInMinutes() {
    return 15
  }
};
