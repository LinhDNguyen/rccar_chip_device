var os = require('os');
var util = require('util');
var path = require('path');
var hashtable = require('hashmap');
var RedisSMQ = require("rsmq");
var player = require('play-sound')(opts = {'player':'mpg123'})

var MUSIC_LIST = new hashtable();
var audio = undefined;
var isPlaying = false;
var musicDir = '/home/chip/rccar_chip_device/sounds';
var rsmq = new RedisSMQ( {host: "127.0.0.1", port: 6379, ns: "rsmq"} );
const QUEUE_NAME = "myqueue";
var jobHdl = undefined;

function soundJob () {
	if (audio != undefined) {
		return;
	}
	console.log("audio is idle");
	rsmq.receiveMessage({qname:QUEUE_NAME}, function (err, resp) {
		if (resp.id) {
			console.log("Message received.", resp)

			var s = resp.message;
			var arr = s.split(":");
			var name = arr[0];
			var volume = int(arr[1]);

			// configure arguments for executable if any
			if (audio != undefined) {
				stopMusic();
			}
			isPlaying = true;
			console.log("Playing ", name, " with volume ", volume);
			audio = player.play(path.join(musicDir, name), { mpg123: ['-g', volume]}, function(err){
				if (err) throw err;
				// Done
				isPlaying = false;
				audio = undefined;
			})
		} else {
			console.log("the log is forgot: ", resp);
		}
	});
}


function initMusic() {
	if (MUSIC_LIST.count() > 0) {
		return;
	}
	// Insert default values
	MUSIC_LIST.set(1, "cat_meow.mp3");
	MUSIC_LIST.set(2, "chicken_cheap_cheap.mp3");
	MUSIC_LIST.set(3, "chicken_cuta.mp3");
	MUSIC_LIST.set(4, "cow_bou.mp3");
	MUSIC_LIST.set(5, "dog_gau.mp3");
	MUSIC_LIST.set(6, "donkey_eu_ue.mp3");
	MUSIC_LIST.set(7, "duck_quacquac.mp3");
	MUSIC_LIST.set(8, "elephan_oeeeee.mp3");
	MUSIC_LIST.set(9, "fog_ock.mp3");
	MUSIC_LIST.set(10, "goat_beebee.mp3");
	MUSIC_LIST.set(11, "horse_heeee.mp3");
	MUSIC_LIST.set(12, "monkey_ouuuuu.mp3");
	MUSIC_LIST.set(13, "pig_ui_uoeee.mp3");
	MUSIC_LIST.set(14, "rooster_oooo.mp3");
	MUSIC_LIST.set(15, "sheep_beee.mp3");

	rsmq.createQueue({qname:QUEUE_NAME}, function (err, resp) {
		if (resp===1) {
			console.log("queue created")
		}
	});

	jobHdl = setInterval(soundJob, 100); // Sound job run each 100ms
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
	var s = music_name + ":" + volume;
	console.log("add music ", s);
	rsmq.sendMessage({qname:QUEUE_NAME, message:s}, function (err, resp) {
		if (resp) {
			console.log("Music added. ID:", resp);
		}
	});
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

module.exports = {
	stop:stopMusic,
	get_name:getName,
	init:initMusic,
	play: addMusic,
};
