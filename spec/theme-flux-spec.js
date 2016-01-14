'use babel'

import {minutesToMilliseconds} from '../lib/time-helpers'
import ThemeFlux from '../lib/theme-flux'

describe('ThemeFlux', () => {
  beforeEach(() => {
    spyOn(Date, "now")
    window.setInterval = window.fakeSetInterval
  })

  it('changes the theme to dark at night, and to light during the day', () => {
    atom.config.set('core.themes', ['', ''])
    Date.now.andReturn(new Date(1994, 4, 22, 23).getTime())
    ThemeFlux.activate()
    expect(atom.config.get('core.themes')).toEqual(['one-dark-ui', 'one-dark-syntax'])

    Date.now.andReturn(new Date(1994, 4, 22, 10).getTime())
    advanceClock(minutesToMilliseconds(ThemeFlux.getCheckIntervalInMinutes()))
    expect(atom.config.get('core.themes')).toEqual(['one-light-ui', 'one-light-syntax'])

    Date.now.andReturn(new Date(1994, 4, 22, 18).getTime())
    advanceClock(minutesToMilliseconds(ThemeFlux.getCheckIntervalInMinutes()))
    expect(atom.config.get('core.themes')).toEqual(['one-dark-ui', 'one-dark-syntax'])

    Date.now.andReturn(new Date(1994, 4, 23, 5).getTime())
    advanceClock(minutesToMilliseconds(ThemeFlux.getCheckIntervalInMinutes()))
    expect(atom.config.get('core.themes')).toEqual(['one-dark-ui', 'one-dark-syntax'])

    Date.now.andReturn(new Date(1994, 4, 23, 7).getTime())
    advanceClock(minutesToMilliseconds(ThemeFlux.getCheckIntervalInMinutes()))
    expect(atom.config.get('core.themes')).toEqual(['one-light-ui', 'one-light-syntax'])
  })
})
