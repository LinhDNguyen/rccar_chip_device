var bleno = require('bleno');
var util = require('util');

var CarSoundCharacteristic = require('./characteristics/car_sound');
var CarMovingCharacteristic = require('./characteristics/car_move');

function CarControlService() {

	bleno.PrimaryService.call(this, {
		uuid: '12345678-1234-5678-1234-56789abcdef0',
		characteristics: [
			new CarMovingCharacteristic(),
			new CarSoundCharacteristic()
		]
	});
};

util.inherits(CarControlService, bleno.PrimaryService);
module.exports = CarControlService;
