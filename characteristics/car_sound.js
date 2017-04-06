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
    console.log("Current audio killed");
  }
}

CarSoundCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  if (MUSIC_LIST.count() == 0) {
    // Insert default values
    MUSIC_LIST.set(1, "Air-On-The-G-String-Various-Artists.mp3");
    MUSIC_LIST.set(2, "Canon-In-D-Various-Artists.mp3");
    MUSIC_LIST.set(3, "Gymnopedie-No-1-Various-Artists.mp3");
    MUSIC_LIST.set(4, "Jesu-Joy-Of-Man-s-Desiring-Various-Artists.mp3");
  }
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  } else if (data.length !== 2) {
    console.log("invalid length " + data.length);
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  } else {
    var music_code = data.readUInt8(0);
    var music_volume = data.readUInt8(1);
    var music_name = 'UNKNOWN';

    console.log("Car Sound " + music_code + ":" + music_volume);
    if (MUSIC_LIST.has(music_code)) {
      music_name = MUSIC_LIST.get(music_code);
      playMusic(music_name, music_volume);
    }
    console.log('play music:' +music_code + '-' + music_name + ';');

    callback(this.RESULT_SUCCESS);
  }
};

util.inherits(CarSoundCharacteristic, BlenoCharacteristic);
module.exports = CarSoundCharacteristic;
