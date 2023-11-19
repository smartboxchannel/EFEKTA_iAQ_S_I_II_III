const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;
const {calibrateAndPrecisionRoundOptions} = require('zigbee-herdsman-converters/lib/utils');


const tzLocal = {
	co2_config: {
        key: ['auto_backlight', 'night_onoff_backlight', 'forced_recalibration', 'factory_reset_co2', 'long_chart_period', 'long_chart_period2', 'manual_forced_recalibration', 'night_on_backlight', 'night_off_backlight'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_backlight: ['msCO2', {0x0203: {value, type: 0x10}}],
				night_onoff_backlight: ['msCO2', {0x0401: {value, type: 0x10}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
				long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
                long_chart_period2: ['msCO2', {0x0244: {value, type: 0x10}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
				night_on_backlight: ['msCO2', {0x0402: {value, type: 0x20}}],
				night_off_backlight: ['msCO2', {0x0403: {value, type: 0x20}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperature_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseInt(rawValue, 10)
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperaturef_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseFloat(rawValue)*10;
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	humidity_config: {
        key: ['humidity_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseInt(rawValue, 10)
            const payloads = {
                humidity_offset: ['msRelativeHumidity', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_gasstat_config: {
        key: ['high_gas', 'low_gas', 'enable_gas', 'invert_logic_gas'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_gas: ['msCO2', {0x0221: {value, type: 0x21}}],
                low_gas: ['msCO2', {0x0222: {value, type: 0x21}}],
				enable_gas: ['msCO2', {0x0220: {value, type: 0x10}}],
				invert_logic_gas: ['msCO2', {0x0225: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
};

const fzLocal = {
	local_time: {
        cluster: 'genTime',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            return {local_time: msg.data.localTime};
        },
    },
	co2: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
				return {co2: Math.round(msg.data.measuredValue * 1000000)};
			}
        },
    },
	co2_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0203)) {
                result.auto_backlight = ['OFF', 'ON'][msg.data[0x0203]];
            }
			if (msg.data.hasOwnProperty(0x0401)) {
                result.night_onoff_backlight = ['OFF', 'ON'][msg.data[0x0401]];
            }
            if (msg.data.hasOwnProperty(0x0202)) {
                result.forced_recalibration = ['OFF', 'ON'][msg.data[0x0202]];
            }
            if (msg.data.hasOwnProperty(0x0206)) {
                result.factory_reset_co2 = ['OFF', 'ON'][msg.data[0x0206]];
            }
			if (msg.data.hasOwnProperty(0x0204)) {
                result.long_chart_period = ['OFF', 'ON'][msg.data[0x0204]];
            }
			if (msg.data.hasOwnProperty(0x0244)) {
                result.long_chart_period2 = ['OFF', 'ON'][msg.data[0x0244]];
            }
            if (msg.data.hasOwnProperty(0x0205)) {
                result.set_altitude = msg.data[0x0205];
            }
            if (msg.data.hasOwnProperty(0x0207)) {
                result.manual_forced_recalibration = msg.data[0x0207];
            }
			 if (msg.data.hasOwnProperty(0x0402)) {
                result.night_on_backlight = msg.data[0x0402];
            }
			 if (msg.data.hasOwnProperty(0x0403)) {
                result.night_off_backlight = msg.data[0x0403];
            }
            return result;
        },
    },
	temperature_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.temperature_offset = msg.data[0x0210];
            }
            return result;
        },
    },
	temperaturef_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.temperature_offset = parseFloat(msg.data[0x0210])/10.0;
            }
            return result;
        },
    },
    humidity_config: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.humidity_offset = msg.data[0x0210];
            }
            return result;
        },
    },
	co2_gasstat_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_gas = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_gas = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_gas = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_gas = ['OFF', 'ON'][msg.data[0x0225]];
            }
            return result;
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_iAQ_S_II'],
        model: 'EFEKTA_iAQ_S_II',
        vendor: 'Custom devices (DiY)',
        description: '[CO2 Mini Monitor with TFT Display, outdoor temperature, date and time.](http://efektalab.com/iAQ_S)',
        fromZigbee: [fz.temperature, fz.humidity, fz.illuminance, fz.pressure, fzLocal.co2, fzLocal.co2_config,
            fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.local_time, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
			const endpoint2 = device.getEndpoint(2);
		    await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement', 'msPressureMeasurement', 'msTemperatureMeasurement', 'msRelativeHumidity']);
			const payload1 = [{attribute: {ID: 0x0000, type: 0x39},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint.configureReporting('msCO2', payload1);
			const payload2 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint.configureReporting('msTemperatureMeasurement', payload2);
			const payload3 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint.configureReporting('msRelativeHumidity', payload3);
			const payload4 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msIlluminanceMeasurement', payload4);
			const payload5 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msPressureMeasurement', payload5);
			const payload6 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint2.configureReporting('msTemperatureMeasurement', payload6);
			const payload7 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msRelativeHumidity', payload7);
        },
		icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAB9CAYAAACPgGwlAAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAACxMAAAsTAQCanBgAAAXRaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMTEtMTlUMjE6NTM6MzArMDM6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMTEtMTlUMjE6NTM6MzArMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTExLTE5VDIxOjUzOjMwKzAzOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmE1NDRiZTI0LTA5NGUtNzY0NC05OWM0LWFhZmRhYmI0YjA0OCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmIyNWQ3ZjBhLThiZDQtYjE0NS04MGI4LTY5ZjFmYzg1YzIzZSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRjM2EyZDdhLTE3NzUtODM0Yy04Y2FlLTUzMGI4MWMxOTIxOSIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRjM2EyZDdhLTE3NzUtODM0Yy04Y2FlLTUzMGI4MWMxOTIxOSIgc3RFdnQ6d2hlbj0iMjAyMy0xMS0xOVQyMTo1MzozMCswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphNTQ0YmUyNC0wOTRlLTc2NDQtOTljNC1hYWZkYWJiNGIwNDgiIHN0RXZ0OndoZW49IjIwMjMtMTEtMTlUMjE6NTM6MzArMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1w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',
        exposes: [e.co2(), e.illuminance(), e.illuminance_lux(), e.pressure(),
		    exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
            exposes.binary('auto_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Enable or Disable Auto Brightness of the Display'),
		    exposes.binary('night_onoff_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Complete shutdown of the backlight at night mode'),
			exposes.numeric('night_on_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode activation time')
                .withValueMin(0).withValueMax(23),
			exposes.numeric('night_off_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode deactivation time')
                .withValueMin(0).withValueMax(23),
			exposes.binary('long_chart_period', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the CO2 level(OFF - 1H | ON - 24H)'),
			exposes.binary('long_chart_period2', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the Pressure level(OFF - 1H | ON - 24H)'),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-50).withValueMax(50),
			exposes.binary('forced_recalibration', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Start FRC (Perform Forced Recalibration of the CO2 Sensor)'),
			exposes.binary('factory_reset_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Factory Reset CO2 sensor'),
            exposes.numeric('manual_forced_recalibration', ea.STATE_SET).withUnit('ppm')
			    .withDescription('Start Manual FRC (Perform Forced Recalibration of the CO2 Sensor)')
                .withValueMin(0).withValueMax(5000),
		    exposes.binary('enable_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable CO2 Gas Control'),
			exposes.binary('invert_logic_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable invert logic CO2 Gas Control'),
            exposes.numeric('high_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting High CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
            exposes.numeric('low_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting Low CO2 Gas Border')
                .withValueMin(400).withValueMax(5000)],
};

module.exports = definition;