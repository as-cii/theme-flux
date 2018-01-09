'use babel';

import { CompositeDisposable } from 'atom';
// import _ from 'underscore-plus';
import SolarCalc from 'solar-calc';

import { minutesToMilliseconds } from './time-helpers';

// Get a human readable title for the given theme name.
// function getThemeTitle(themeName = '') {
//   const title = themeName.replace(/-(ui|syntax)/g, '').replace(/-theme$/g, '')
//   return _.undasherize(_.uncamelcase(title));
// }

function themeToConfigStringEnum({ metadata: { name } }) {
  return name;
  // return {
  //   value: name,
  //   description: getThemeTitle(name),
  // };
}

const loadedThemes = atom.themes.getLoadedThemes();

const uiThemesEnum = loadedThemes
  .filter(theme => theme.metadata.theme === 'ui')
  .map(themeToConfigStringEnum);

const syntaxThemesEnum = loadedThemes
  .filter(theme => theme.metadata.theme === 'syntax')
  .map(themeToConfigStringEnum);

export default {
  intervalId: null,

  wasDay: null,

  config: {
    day: {
      order: 1,
      type: 'object',
      properties: {
        ui: {
          order: 1,
          title: 'UI Theme',
          type: 'string',
          default: 'one-light-ui',
          enum: uiThemesEnum,
        },
        syntax: {
          order: 2,
          title: 'Syntax Theme',
          type: 'string',
          default: 'one-light-syntax',
          enum: syntaxThemesEnum,
        },
      },
    },
    night: {
      order: 2,
      type: 'object',
      properties: {
        ui: {
          order: 1,
          title: 'UI Theme',
          type: 'string',
          default: 'one-dark-ui',
          enum: uiThemesEnum,
        },
        syntax: {
          order: 2,
          title: 'Syntax Theme',
          type: 'string',
          default: 'one-dark-syntax',
          enum: syntaxThemesEnum,
        },
      },
    },
    geolocation: {
      order: 3,
      type: 'object',
      properties: {
        useGeolocationApi: {
          order: 1,
          title: 'Use Geolocation API',
          description: 'Disable this if the location cannot be ascertained by the API',
          type: 'boolean',
          default: true,
        },
        specifiedLatitude: {
          order: 2,
          title: 'Specified Latitude',
          description: 'Only used when API is disabled',
          type: 'number',
          default: 0,
          minimum: -90,
          maximum: 90,
        },
        specifiedLongitude: {
          order: 3,
          title: 'Specified Longitude',
          description: 'Only used when API is disabled',
          type: 'number',
          default: 0,
          minimum: -180,
          maximum: 180,
        },
      },
    },
  },

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('theme-flux', () => {
      this.wasDay = null; // force theme update
      this.changeTheme();
    }));

    const milliseconds = minutesToMilliseconds(this.getCheckIntervalInMinutes());
    this.intervalId = setInterval(this.changeTheme.bind(this), milliseconds);
    this.changeTheme();
  },

  deactivate() {
    this.subscriptions.dispose();

    clearInterval(this.intervalId);
    this.intervalId = null;
  },

  changeTheme() {
    if (atom.config.get('theme-flux.geolocation.useGeolocationApi')) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => this.latLongCallback(latitude, longitude),
        err => atom.notifications.addError('theme-flux: '+(err.message || 'unknown error encountered while getting geolocation')),
        {timeout: 10000}
      );
    }
    else {
      this.latLongCallback(
          atom.config.get('theme-flux.geolocation.specifiedLatitude'),
          atom.config.get('theme-flux.geolocation.specifiedLongitude')
      );
    }
  },

  latLongCallback(latitude, longitude) {
    const solar = new SolarCalc(new Date(), latitude, longitude);

    const isDay = this.isDay(solar);
    if (isDay === this.wasDay) return;

    if (isDay) {
      this.scheduleThemeUpdate([
        atom.config.get('theme-flux.day.ui'),
        atom.config.get('theme-flux.day.syntax'),
      ]);
    } else {
      this.scheduleThemeUpdate([
        atom.config.get('theme-flux.night.ui'),
        atom.config.get('theme-flux.night.syntax'),
      ]);
    }

    this.wasDay = isDay;
  },

  scheduleThemeUpdate(themes) {
    setTimeout(() => atom.config.set('core.themes', themes), 100);
  },

  isDay({ sunrise, sunset }) {
    const now = new Date();
    return now >= sunrise && now <= sunset;
  },

  getCheckIntervalInMinutes() {
    return 15;
  },
};
