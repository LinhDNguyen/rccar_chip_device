var bleno = require('bleno');
var os = require('os');
var util = require('util');
var five = require('johnny-five');
var chipio = require('chip-io');

var leftDir = ["XIO-P0", "XIO-P2"];
var rightDir = ["XIO-P4", "XIO-P6"];

var leftPins = [];
var rightPins = [];
var pwmHandle;

var board = new five.Board({
  io: new chipio(),
  repl: false
});

var SIDE_LEFT=2;
var SIDE_RIGHT=1;

var DIR_FORWARD=1;
var DIR_BACKWARD=2;
var DIR_BREAK=3;
var DIR_FREE=4;

function setPWM(val) {
  // Set PWM duty cycle
  if (!pwmHandle) {
    return false;
  }

  var pwm = ((val * 255) / 100) % 256;
  // console.log('PWM: ' + pwm + '(' + val + ')');
  pwmHandle.brightness(pwm);

  return true;
}

function setDirection(direction, leftright) {
  // Set direction of one side
  var pins;

  if (leftright == SIDE_LEFT) {
    pins = leftPins;
  } else if (leftright == SIDE_RIGHT) {
    pins = rightPins;
  } else {
    return false;
  }

  switch (direction) {
  case DIR_FORWARD:
    pins[0].high();
    pins[1].low();
    // console.log('lr:dir  -->  ' + leftright + ':forward');
    break;
  case DIR_BACKWARD:
    pins[0].low();
    pins[1].high();
    // console.log('lr:dir  -->  ' + leftright + ':backward');
    break;
  case DIR_BREAK:
    pins[0].high();
    pins[1].high();
    // console.log('lr:dir  -->  ' + leftright + ':break');
    break;
  default:
    pins[0].low();
    pins[1].low();
    // console.log('lr:dir  -->  ' + leftright + ':off');
    break;
  }

  return true;
}

board.on('ready', function() {
  // do Johnny-Five stuff

  // Create pins
  leftPins[0] = new five.Pin({pin:leftDir[0]})
  leftPins[1] = new five.Pin({pin:leftDir[1]})
  rightPins[0] = new five.Pin({pin:rightDir[0]})
  rightPins[1] = new five.Pin({pin:rightDir[1]})

  pwmHandle = new five.Led('PWM0');
  // pwmHandle.strobe(2);
  // pwmHandle.pulse(1); // Make it pulse with a 1 second interval
  setPWM(0);
  setDirection(DIR_FREE, SIDE_LEFT);
  setDirection(DIR_FREE, SIDE_RIGHT);
});

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

    // console.log('a:' + angle + ',p:' + power);

    if (power > 40) {
      if ((angle > 45) && (angle <= 135)) {
        // turn left
        setDirection(DIR_BACKWARD, SIDE_LEFT);
        setDirection(DIR_FORWARD, SIDE_RIGHT);
        // console.log('turn left');
      } else if ((angle > 135) && (angle <= 225)) {
        // backward
        setDirection(DIR_BACKWARD, SIDE_LEFT);
        setDirection(DIR_BACKWARD, SIDE_RIGHT);
        // console.log('backward');
      } else if ((angle > 225) && (angle <= 315)) {
        // turn right
        setDirection(DIR_FORWARD, SIDE_LEFT);
        setDirection(DIR_BACKWARD, SIDE_RIGHT);
        // console.log('turn right');
      } else {
        // forward
        setDirection(DIR_FORWARD, SIDE_LEFT);
        setDirection(DIR_FORWARD, SIDE_RIGHT);
        // console.log('forward');
      }
    }

    if (power > 90) {
      setPWM(100);
    } else if (power > 80) {
      setPWM(90);
    } else if (power > 70) {
      setPWM(80);
    } else if (power > 40) {
      setPWM(70);
    } else {
      // Turnoff
      setPWM(0);
      // console.log('turn off');
      // Free direction
      setDirection(DIR_FREE, SIDE_LEFT);
      setDirection(DIR_FREE, SIDE_RIGHT);
    }

    callback(this.RESULT_SUCCESS);
  }
};

util.inherits(CarMovingCharacteristic, BlenoCharacteristic);
module.exports = CarMovingCharacteristic;
