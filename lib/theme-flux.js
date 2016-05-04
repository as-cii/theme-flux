'use babel';

import {minutesToMilliseconds} from './time-helpers'
import packageConfig from './config-schema.json'
import { CompositeDisposable } from 'atom'

export default {
  config: packageConfig,
  subscriptions: null,
  intervalId: null,
  wasDay: null,

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.config.onDidChange('theme-flux', ({newValue, oldValue}) => {
        this.changeTheme()
      })
    )
    let milliseconds = minutesToMilliseconds(this.getCheckIntervalInMinutes())
    this.intervalId = setInterval(this.changeTheme.bind(this), milliseconds)
    this.changeTheme()
  },

  deactivate() {
    this.subscriptions.dispose()
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
    let startOfDay = atom.config.get('theme-flux.startOfDay')
    let endOfDay = atom.config.get('theme-flux.endOfDay')
    let hours = new Date(Date.now()).getHours()
    return hours >= startOfDay && hours < endOfDay
  },

  getCheckIntervalInMinutes() {
    return 15
  }
};
