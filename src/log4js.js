/* global require, module, exports */
var LoggingEnhancer = require('../bower_components/better-logging-base/dist/logging-enhancer.min').LoggingEnhancer;

(function() {
    'use strict';

    var ConsoleLogger = function(sprintf, moment) {
        var self = this;

        var logEnhancer = new LoggingEnhancer(sprintf, moment);

        this.logLevels = logEnhancer.logLevels;
        this.LEVEL = logEnhancer.LEVEL;

        this.datetimePattern = 'LLL'; // default datetime stamp pattern, overwrite in config phase
        this.datetimeLocale = 'en';

        var hasWindow = typeof window !== 'undefined';
        this.datetimeLocale = (hasWindow && (window.navigator.userLanguage || window.navigator.language)) || 'en';

        this.prefixPattern = '%s::[%s]> '; // default prefix pattern, overwrite in config phase

        // keep originals for global logging (else context loggers have double output)
        var logDebug, logLog, logInfo, logWarn, logError;

        this.enhanceLogging = function(console) {
            if (!logDebug) {
                logDebug = console.debug;
                logLog = console.log;
                logInfo = console.info;
                logWarn = console.warn;
                logError = console.error;
            }

            // override global logging functions to add at least a timestamp
            console.trace = logEnhancer.enhanceLogging(bind(console.debug), logEnhancer.LEVEL.TRACE, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.debug = logEnhancer.enhanceLogging(bind(console.debug), logEnhancer.LEVEL.DEBUG, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.log = logEnhancer.enhanceLogging(bind(console.log), logEnhancer.LEVEL.INFO, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.info = logEnhancer.enhanceLogging(bind(console.info), logEnhancer.LEVEL.INFO, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.warn = logEnhancer.enhanceLogging(bind(console.warn), logEnhancer.LEVEL.WARN, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.error = logEnhancer.enhanceLogging(bind(console.error), logEnhancer.LEVEL.ERROR, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);

            console.getLogger = function(context) {
                var logger = {
                    trace: logEnhancer.enhanceLogging(bind(logDebug), logEnhancer.LEVEL.TRACE, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    debug: logEnhancer.enhanceLogging(bind(logDebug), logEnhancer.LEVEL.DEBUG, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    log: logEnhancer.enhanceLogging(bind(logLog), logEnhancer.LEVEL.INFO, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    info: logEnhancer.enhanceLogging(bind(logInfo), logEnhancer.LEVEL.INFO, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    warn: logEnhancer.enhanceLogging(bind(logWarn), logEnhancer.LEVEL.WARN, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    error: logEnhancer.enhanceLogging(bind(logError), logEnhancer.LEVEL.ERROR, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern)
                };
                return logger;
            };

            // check optional dependencies
            if (!sprintf) {
                console.warn('[console-logger] sprintf.js not found: https://github.com/alexei/sprintf.js, using fixed layout pattern "%s::[%s]> "');
            }
            if (!moment) {
                console.warn('[console-logger] moment.js not found: http://momentjs.com, using non-localized simple Date format');
            }
            
            var logger = logEnhancer.enhanceLogging(bind(logInfo), logEnhancer.LEVEL.INFO, 'console-logger', this, this.datetimePattern, this.datetimeLocale, this.prefixPattern);
            logger('logging enhancer initiated');
        };
    };

    // manage dependency exports
    if (typeof module !== 'undefined') {
        module.exports.ConsoleLogger = ConsoleLogger;
    }
    else if (typeof exports !== 'undefined') {
        exports.ConsoleLogger = ConsoleLogger;
    }
    else if (typeof window === 'undefined') {
        throw new Error('unable to expose ConsoleLogger: no module, exports object and no global window detected');
    }

    if (typeof window !== 'undefined') {
        window.consoleLogger = new ConsoleLogger(window.sprintf, window.moment);
    }

    function bind(func) {
        return function() {
            func.apply(console, arguments);
        };
    }
}());