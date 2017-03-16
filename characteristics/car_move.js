var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var CarMovingCharacteristic = function() {

 CarMovingCharacteristic.super_.call(this, {
    uuid: '12345678-1234-5678-1234-56789abcdef1',
    properties: ['write', 'writeWithoutResponse'],
  });

  this._value = new Buffer(0);
};

CarMovingCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  } else if (data.length !== 4) {
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  } else {
    var angle = data.readUInt16LE(0);
    var power = data.readUInt16LE(2);

    console.log('a:' + angle + ',p:' + power);

    callback(this.RESULT_SUCCESS);
  }
};

util.inherits(CarMovingCharacteristic, BlenoCharacteristic);
module.exports = CarMovingCharacteristic;
