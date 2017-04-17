var os = require('os');
var util = require('util');
var path = require('path');
var hashtable = require('hashmap');
var player = require('play-sound')(opts = {'player':'mpg123'})

var MUSIC_LIST = new hashtable();
var audio = undefined;
var isPlaying = false;
var musicDir = '/home/chip/rccar_device_chip/sounds';
var jobHdl = undefined;
var PLAY_LIST = [];
var lastPlay = undefined;
var lastVolume = 100;

function soundJob () {
	if (audio != undefined) {
		return;
	}
	if (PLAY_LIST.length <= 0) {
		return;
	}
	var s = PLAY_LIST.pop();
	console.log("Message received.", s)

	var arr = s.split(":");
	var name = arr[0];
	var volume = Number(arr[1]);

	// configure arguments for executable if any
	if (audio != undefined) {
		stopMusic();
	}
	isPlaying = true;
	lastPlay = name;
	lastVolume = volume;
	console.log("Playing ", name, " with volume ", volume);
	audio = player.play(path.join(musicDir, name), { mpg123: ['-g', volume]}, function(err){
		if (err) throw err;
		// Done
		isPlaying = false;
		audio = undefined;
		console.log("Sound ", name, " is DONE!");
	})

}


function initMusic() {
	if (MUSIC_LIST.count() > 0) {
		return;
	}
	// Insert default values
	MUSIC_LIST.set(0, "___NO_SOUND___");
	MUSIC_LIST.set(1, "cat_meow.mp3");
	MUSIC_LIST.set(2, "chicken_cheap_cheap.mp3");
	MUSIC_LIST.set(3, "chicken_cuta.mp3");
	MUSIC_LIST.set(4, "cow_bou.mp3");
	MUSIC_LIST.set(5, "dog_gau.mp3");
	MUSIC_LIST.set(6, "donkey_eu_ue.mp3");
	MUSIC_LIST.set(7, "duck_quacquac.mp3");
	MUSIC_LIST.set(8, "elephan_oeeeee.mp3");
	MUSIC_LIST.set(9, "frog_ock.mp3");
	MUSIC_LIST.set(10, "goat_beebee.mp3");
	MUSIC_LIST.set(11, "horse_heeee.mp3");
	MUSIC_LIST.set(12, "monkey_ouuuuu.mp3");
	MUSIC_LIST.set(13, "pig_ui_uoeee.mp3");
	MUSIC_LIST.set(14, "rooster_oooo.mp3");
	MUSIC_LIST.set(15, "sheep_beee.mp3");
	MUSIC_LIST.set(16, "police_car1.mp3");

	jobHdl = setInterval(soundJob, 100); // Sound job run each 100ms
	console.log("100ms interval job created: ", jobHdl);
}

function getName(code) {
	if (MUSIC_LIST.count() == 0) {
		initMusic();
	}
	if (MUSIC_LIST.has(code)) {
		return MUSIC_LIST.get(code);
	}
	return undefined;
}

function addMusic(music_name, volume) {
	if (music_name === "___NO_SOUND___") {
		noSound();
		return;
	}
	var s = music_name + ":" + volume;
	console.log("add music ", s);
	PLAY_LIST.splice(0, 0, s);
	console.log("Music added. ID:", s);
}

function stopMusic() {
	if ((isPlaying) && (audio != undefined)) {
		audio.kill();
		isPlaying = false;
		audio = undefined;
		console.log("Current audio killed");
	}
	clearInterval(jobHdl);
}

function playLast() {
	if (audio != undefined) {
		return;
	}
	if (lastPlay != undefined) {
		addMusic(lastPlay, lastVolume);
	}
}

function noSound() {
	if ((isPlaying) && (audio != undefined)) {
		audio.kill();
		isPlaying = false;
		audio = undefined;
		console.log("No sound");
		lastPlay = undefined;
		PLAY_LIST = [];
	}
}

module.exports = {
	stop:stopMusic,
	get_name:getName,
	init:initMusic,
	play: addMusic,
	play_last: playLast,
	nosound: noSound,
};
