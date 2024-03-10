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
        key: ['forced_recalibration', 'factory_reset_co2', 'long_chart_period', 
		     'long_chart_period2', 'set_altitude', 'manual_forced_recalibration', 'automatic_scal', 'internal_or_external'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(3);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
				long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
				long_chart_period2: ['msCO2', {0x0244: {value, type: 0x10}}],
                set_altitude: ['msCO2', {0x0205: {value, type: 0x21}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
				internal_or_external: ['msCO2', {0x0288: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_config2: {
        key: ['auto_backlight', 'night_onoff_backlight', 'night_on_backlight', 'night_off_backlight'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_backlight: ['msIlluminanceMeasurement', {0x0203: {value, type: 0x10}}],
				night_onoff_backlight: ['msIlluminanceMeasurement', {0x0401: {value, type: 0x10}}],
				night_on_backlight: ['msIlluminanceMeasurement', {0x0405: {value, type: 0x20}}],
				night_off_backlight: ['msIlluminanceMeasurement', {0x0406: {value, type: 0x20}}],
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
        key: ['high_co2', 'low_co2', 'enable_co2', 'invert_logic_co2'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_co2: ['msCO2', {0x0221: {value, type: 0x21}}],
                low_co2: ['msCO2', {0x0222: {value, type: 0x21}}],
				enable_co2: ['msCO2', {0x0220: {value, type: 0x10}}],
				invert_logic_co2: ['msCO2', {0x0225: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	voc_gasstat_config: {
        key: ['high_voc', 'low_voc', 'enable_voc', 'invert_logic_voc'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_voc: ['genAnalogInput', {0x0221: {value, type: 0x21}}],
                low_voc: ['genAnalogInput', {0x0222: {value, type: 0x21}}],
				enable_voc: ['genAnalogInput', {0x0220: {value, type: 0x10}}],
				invert_logic_voc: ['genAnalogInput', {0x0225: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	voc_config: {
        key: ['voc_raw_data'],
		 convertGet: async (entity, key, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const payloads = {
                voc_raw_data: ['genAnalogInput', 0x0065],
            };
            await endpoint.read(payloads[key][0], [payloads[key][1]]);
        },
    },
};

const fzLocal = {
	co2: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
				return {co2: Math.round(msg.data.measuredValue * 1000000)};
			}
        },
    },
	air_quality: {
        cluster: 'genAnalogInput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			const result = {};
            if (msg.data.hasOwnProperty(0x0065)) {
                result.voc_raw_data = msg.data[0x0065];
            }
			if (msg.data.hasOwnProperty('presentValue')) {
			    result.voc_index = msg.data.presentValue;
			}
			return result;
        },
    },
	co2_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
			if (msg.data.hasOwnProperty(0x0402)) {
                result.automatic_scal = ['OFF', 'ON'][msg.data[0x0402]];
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
			if (msg.data.hasOwnProperty(0x0288)) {
                result.internal_or_external = ['OFF', 'ON'][msg.data[0x0288]];
            }
            return result;
        },
    },
	co2_config2: {
        cluster: 'msIlluminanceMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0203)) {
                result.auto_backlight = ['OFF', 'ON'][msg.data[0x0203]];
            }
			if (msg.data.hasOwnProperty(0x0401)) {
                result.night_onoff_backlight = ['OFF', 'ON'][msg.data[0x0401]];
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
                result.high_co2 = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_co2 = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_co2 = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_co2 = ['OFF', 'ON'][msg.data[0x0225]];
            }
            return result;
        },
    },
	voc_gasstat_config: {
        cluster: 'genAnalogInput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_voc = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_voc = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_voc = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_voc = ['OFF', 'ON'][msg.data[0x0225]];
            }
            return result;
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_iAQ_S_III'],
        model: 'EFEKTA_iAQ_S_III',
        vendor: 'Custom devices (DiY)',
        description: '[CO2 and VOC Mini Monitor with TFT Display, outdoor temperature, date and time, direct control of external relays.](http://efektalab.com/iAQ_S)',
        fromZigbee: [fz.temperature, fz.humidity, fz.illuminance, fzLocal.co2, fzLocal.air_quality, fzLocal.co2_config, fzLocal.co2_config2, fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.co2_gasstat_config, fzLocal.voc_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.co2_config2, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config, tzLocal.voc_gasstat_config, tzLocal.voc_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
			const endpoint2 = device.getEndpoint(2);
		    await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement', 'genAnalogInput', 'msTemperatureMeasurement', 'msRelativeHumidity']);
			const endpoint3 = device.getEndpoint(3);
		    await reporting.bind(endpoint3, coordinatorEndpoint, ['msCO2']);
			const payload1 = [{attribute: {ID: 0x0000, type: 0x39},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint3.configureReporting('msCO2', payload1);
			const payload2 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint.configureReporting('msTemperatureMeasurement', payload2);
			const payload3 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint.configureReporting('msRelativeHumidity', payload3);
			const payload4 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msIlluminanceMeasurement', payload4);
			const payload5 = [{attribute: {ID: 0x0055, type: 0x39},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('genAnalogInput', payload5);
			const payload6 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint2.configureReporting('msTemperatureMeasurement', payload6);
			const payload7 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msRelativeHumidity', payload7);
        },
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAXRaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDMtMTBUMDI6MzM6MzErMDM6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDMtMTBUMDI6MzM6MzErMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAzLTEwVDAyOjMzOjMxKzAzOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjUxOTZkODAwLTVhZDMtZjA0Ni04MTE1LWZhNWQ1NWY4N2VlYyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjBlZGRkMzg2LTNiYWUtZDA0Ny04YmVkLTMwZDZkMjQ0YzQ2ZiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY0OGY0ZWRiLWQ1ZmMtZDg0Zi04OWEyLWE5Y2U2OTZmNDk0MSIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY0OGY0ZWRiLWQ1ZmMtZDg0Zi04OWEyLWE5Y2U2OTZmNDk0MSIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0xMFQwMjozMzozMSswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1MTk2ZDgwMC01YWQzLWYwNDYtODExNS1mYTVkNTVmODdlZWMiIHN0RXZ0OndoZW49IjIwMjQtMDMtMTBUMDI6MzM6MzErMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1w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',
        exposes: [e.co2(), 
			exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
		    exposes.numeric('voc_index', ea.STATE).withUnit('VOC Index points').withDescription('VOC INDEX'),
            exposes.numeric('voc_raw_data', ea.STATE_GET).withUnit('ticks').withDescription('SRAW_VOC, digital raw value'),
			e.illuminance_lux(), e.illuminance(),
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
			    .withDescription('The period of plotting the VOC level(OFF - 1H | ON - 24H)'),
			exposes.binary('internal_or_external', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Display data from internal or external TH sensor'),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-50).withValueMax(50),
			exposes.numeric('set_altitude', ea.STATE_SET).withUnit('meters')
			    .withDescription('Setting the altitude above sea level (for high accuracy of the CO2 sensor)')
                .withValueMin(0).withValueMax(3000),
			exposes.binary('automatic_scal', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Automatic self calibration'),
			exposes.binary('forced_recalibration', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Start FRC (Perform Forced Recalibration of the CO2 Sensor)'),
			exposes.binary('factory_reset_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Factory Reset CO2 sensor'),
            exposes.numeric('manual_forced_recalibration', ea.STATE_SET).withUnit('ppm')
			    .withDescription('Start Manual FRC (Perform Forced Recalibration of the CO2 Sensor)')
                .withValueMin(0).withValueMax(5000),
		    exposes.binary('enable_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable CO2 Gas Control'),
			exposes.binary('invert_logic_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable invert logic CO2 Gas Control'),
            exposes.numeric('high_co2', ea.STATE_SET).withUnit('ppm').withDescription('Setting High CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
            exposes.numeric('low_co2', ea.STATE_SET).withUnit('ppm').withDescription('Setting Low CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
			exposes.binary('enable_voc', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable CO2 Gas Control'),
			exposes.binary('invert_logic_voc', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable invert logic CO2 Gas Control'),
            exposes.numeric('high_voc', ea.STATE_SET).withUnit('ppm').withDescription('Setting High CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
            exposes.numeric('low_voc', ea.STATE_SET).withUnit('ppm').withDescription('Setting Low CO2 Gas Border')
                .withValueMin(400).withValueMax(5000)],
};

module.exports = definition;