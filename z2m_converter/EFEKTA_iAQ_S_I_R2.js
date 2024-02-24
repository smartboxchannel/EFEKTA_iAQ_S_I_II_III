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
        key: ['reading_interval', 'auto_backlight', 'night_onoff_backlight', 'flip_data_th',  'forced_recalibration', 'factory_reset_co2', 'automatic_scal', 'long_chart_period', 'long_chart_period2', 'long_chart_period3', 'manual_forced_recalibration', 'night_on_backlight', 'night_off_backlight'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
				reading_interval: ['msCO2', {0x0201: {value, type: 0x21}}],
                auto_backlight: ['msCO2', {0x0203: {value, type: 0x10}}],
				night_onoff_backlight: ['msCO2', {0x0401: {value, type: 0x10}}],
				flip_data_th: ['msCO2', {0x0291: {value, type: 0x10}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
				long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
                long_chart_period2: ['msCO2', {0x0244: {value, type: 0x10}}],
				long_chart_period3: ['msCO2', {0x0245: {value, type: 0x10}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
				night_on_backlight: ['msCO2', {0x0405: {value, type: 0x20}}],
				night_off_backlight: ['msCO2', {0x0406: {value, type: 0x20}}],
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
                humidity_offset: ['msRelativeHumidity', {0x0210: {value, type: 0x28}}],
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
			if (msg.data.hasOwnProperty(0x0201)) {
                result.reading_interval = msg.data[0x0201];
            }
            if (msg.data.hasOwnProperty(0x0203)) {
                result.auto_backlight = ['OFF', 'ON'][msg.data[0x0203]];
            }
			if (msg.data.hasOwnProperty(0x0401)) {
                result.night_onoff_backlight = ['OFF', 'ON'][msg.data[0x0401]];
            }
			if (msg.data.hasOwnProperty(0x0291)) {
                result.flip_data_th = ['OFF', 'ON'][msg.data[0x0291]];
            }
            if (msg.data.hasOwnProperty(0x0202)) {
                result.forced_recalibration = ['OFF', 'ON'][msg.data[0x0202]];
            }
            if (msg.data.hasOwnProperty(0x0206)) {
                result.factory_reset_co2 = ['OFF', 'ON'][msg.data[0x0206]];
            }
			if (msg.data.hasOwnProperty(0x0402)) {
                result.automatic_scal = ['OFF', 'ON'][msg.data[0x0402]];
            }
			if (msg.data.hasOwnProperty(0x0204)) {
                result.long_chart_period = ['OFF', 'ON'][msg.data[0x0204]];
            }
			if (msg.data.hasOwnProperty(0x0244)) {
                result.long_chart_period2 = ['OFF', 'ON'][msg.data[0x0244]];
            }
			if (msg.data.hasOwnProperty(0x0245)) {
                result.long_chart_period3 = ['OFF', 'ON'][msg.data[0x0245]];
            }
            if (msg.data.hasOwnProperty(0x0205)) {
                result.set_altitude = msg.data[0x0205];
            }
            if (msg.data.hasOwnProperty(0x0207)) {
                result.manual_forced_recalibration = msg.data[0x0207];
            }
			 if (msg.data.hasOwnProperty(0x0405)) {
                result.night_on_backlight = msg.data[0x0405];
            }
			 if (msg.data.hasOwnProperty(0x0406)) {
                result.night_off_backlight = msg.data[0x0406];
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
        zigbeeModel: ['EFEKTA_iAQS_I'],
        model: 'EFEKTA_iAQS_I',
        vendor: 'Custom devices (DiY)',
        description: '[EFEKTA_iAQS_I - CO2 Mini Monitor with TFT Display, outdoor temperature and humidity, date and time.](http://efektalab.com/iAQS)',
        fromZigbee: [fz.temperature, fz.humidity, fz.illuminance, fz.pressure, fzLocal.co2, fzLocal.co2_config,
            fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.local_time, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			await reporting.bind(endpoint, coordinatorEndpoint, [
                'genTime', 'msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
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
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAa7aVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDItMjVUMDE6MzU6NTkrMDM6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDItMjVUMDE6MzU6NTkrMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAyLTI1VDAxOjM1OjU5KzAzOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxYmNiNGZlLTYwODktOTA0OS1hNzUwLWNiYTgxN2VkM2U4ZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjI5ZjgxODIyLTA0ODctNmM0NC1iYWZjLTRlNjY1NmY2NWY3ZiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjhkNTI2NmM2LWVjZGMtNjM0Ni05ZmQ5LTBjZWIzNjBlMWQ2NSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhkNTI2NmM2LWVjZGMtNjM0Ni05ZmQ5LTBjZWIzNjBlMWQ2NSIgc3RFdnQ6d2hlbj0iMjAyNC0wMi0yNVQwMTozNTo1OSswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMWJjYjRmZS02MDg5LTkwNDktYTc1MC1jYmE4MTdlZDNlOGQiIHN0RXZ0OndoZW49IjIwMjQtMDItMjVUMDE6MzU6NTkrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1w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',
        exposes: [e.co2(), e.pressure(), e.illuminance(), e.illuminance_lux(),
		    exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
		    exposes.numeric('reading_interval', ea.STATE_SET).withUnit('Seconds').withDescription('Setting the sensor reading interval Setting the time in seconnds, by default 30 seconds')
                .withValueMin(15).withValueMax(300),
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
			    .withDescription('The period of plotting the Temperature level(OFF - 1H | ON - 24H)'),
			exposes.binary('long_chart_period3', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the Humidity level(OFF - 1H | ON - 24H)'),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-99).withValueMax(99),
			exposes.binary('flip_data_th', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Flip TH Data'),
			exposes.binary('automatic_scal', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Automatic self calibration'),
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