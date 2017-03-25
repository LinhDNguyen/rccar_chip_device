var bleno = require('bleno');
var os = require('os');
var util = require('util');
var path = require('path');
var hashtable = require('hashmap');
var player = require('play-sound')(opts = {'player':'mpg123'})
var BlenoCharacteristic = bleno.Characteristic;
var MUSIC_LIST = new hashtable();
var audio = undefined;
var isPlaying = false;
var musicDir = '/home/chip/music';

var CarSoundCharacteristic = function() {

  CarSoundCharacteristic.super_.call(this, {
    uuid: '12345678-1234-5678-1234-56789abcdef2',
    properties: ['write', 'writeWithoutResponse'],
  });
};

function playMusic(name, volume) {
  // configure arguments for executable if any
  if (audio != undefined) {
    stopMusic();
  }
  isPlaying = true;
  audio = player.play(path.join(musicDir, name), { mpg123: ['-g', volume]}, function(err){
    if (err) throw err;

    // Done
    isPlaying = false;
    audio = undefined;
  })
}

function stopMusic() {
  if ((isPlaying) && (audio != undefined)) {
    audio.kill();
    isPlaying = false;
    audio = undefined;
  }
}

CarSoundCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  if (MUSIC_LIST.count() == 0) {
    // Insert default values
    MUSIC_LIST.set(1, "Music 1.mp3");
    MUSIC_LIST.set(2, "Music 2.mp3");
    MUSIC_LIST.set(3, "Music 3.mp3");
  }
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  } else if (data.length !== 2) {
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  } else {
    var music_code = data.readUInt16LE(0);
    var music_name = 'UNKNOWN';

    if (MUSIC_LIST.has(music_code)) {
      music_name = MUSIC_LIST.get(music_code);
    }
    console.log('play music:' +music_code + '-' + music_name + ';');

    callback(this.RESULT_SUCCESS);
  }
};

util.inherits(CarSoundCharacteristic, BlenoCharacteristic);
module.exports = CarSoundCharacteristic;
