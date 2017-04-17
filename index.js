var bleno = require('bleno');

var CarControlService = require('./carcontrolservice');

var carService = new CarControlService();

bleno.on('stateChange', function(state) {
	console.log('on -> stateChange: ' + state);

	if (state === 'poweredOn') {

		bleno.startAdvertising('RC CAR', [carService.uuid]);
	}
	else {

		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', function(error) {

	console.log('on -> advertisingStart: ' +
		(error ? 'error ' + error : 'success')
	);

	if (!error) {

		bleno.setServices([
			carService
		]);
	}
});

bleno.on('disconnect', function(clientAddress) {
	console.log('on -> disconnect: ' + clientAddress + ". Program will exit!!!");

	process.exit();
});

bleno.on('advertisingStop', function() {
	console.log('on -> advertisingStop:' + clientAddress);

	process.exit();
});
