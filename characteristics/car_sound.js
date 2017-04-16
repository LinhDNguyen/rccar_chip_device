var bleno = require('bleno');
var os = require('os');
var util = require('util');
var path = require('path');
var BlenoCharacteristic = bleno.Characteristic;
var SoundPlayer = require('./sound_play.js');

var CarSoundCharacteristic = function() {
	CarSoundCharacteristic.super_.call(this, {
		uuid: '12345678-1234-5678-1234-56789abcdef2',
		properties: ['write', 'writeWithoutResponse'],
	});
};

CarSoundCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
	if (offset) {
		callback(this.RESULT_ATTR_NOT_LONG);
	} else if (data.length !== 2) {
		console.log("invalid length " + data.length);
		callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
	} else {
		var music_code = data.readUInt8(0);
		var music_volume = data.readUInt8(1);
		SoundPlayer.init();

		console.log("Car Sound " + music_code + ":" + music_volume);
		var music_name = SoundPlayer.get_name(music_code);
		if (music_name != undefined) {
			SoundPlayer.play(music_name, music_volume);
			console.log('play music:' +music_code + '-' + music_name + ';');
		}

		callback(this.RESULT_SUCCESS);
	}
};

util.inherits(CarSoundCharacteristic, BlenoCharacteristic);
module.exports = CarSoundCharacteristic;
