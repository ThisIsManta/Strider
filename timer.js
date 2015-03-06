﻿$(document).ready(function () {
	if ($('#logo-container').children().length > 1) {
		$('#logo-container').children().hide().eq(0).show();
		playLogo();
	}

	$('#time-button').on('click', function (e) {
		time();

		$(e.currentTarget).blur();
		e.preventDefault();
	});

	$('#lap-button').on('click', function (e) {
		lap();

		$(e.currentTarget).blur();
		e.preventDefault();
	});

	$(window).trigger('resize');
});

$(window).on('resize', function () {
	var widthRatio = $('#dial-container').data('width-ratio');
	var availWidth = $(window).width();
	$('#time-container').css('font-size', (widthRatio * availWidth * 0.0083) + 'em');
	$('#rank-container').css('font-size', ((1 - widthRatio) * availWidth * 0.0063) + 'em');
});

console.log('Enter or S = Start/Stop/Reset');
console.log('Space or L = Capture');
console.log('         A = Show/Hide timer');
console.log('F11        = Go full screen');

$(document).on('keyup', function (e) {
	if (e.keyCode === 13 /* Enter */ || e.keyCode === 83 /* S */) {
		time();

	} else if (e.keyCode === 32 /* Space */ || e.keyCode === 76 /* L */) {
		lap();

	} else if (e.keyCode === 65 /* A */) {
		$('#time-container, #button-container').toggle({ effect: 'scale' });
	}
});

var now = null;
var isRunning = false;

function time() {
	if (isRunning) {
		isRunning = false;
		$('#time-container').css('color', 'red');
		$('#time-button').text('Reset').css('background', 'red');
		$('#lap-button').attr('disabled', true);

	} else if (now !== null) {
		console.log('---')
		now = null;
		update();
		$('#time-container').css('color', '');
		$('#time-button').text('Start').css('background', '');
		$('#dial-container').width('100%');
		$('#rank-container').width('0%').find('ol').empty();

	} else {
		now = moment();
		isRunning = true;
		tick();
		$('#time-button').text('Stop');
		$('#lap-button').attr('disabled', null);
	}
}

function tick() {
	if (isRunning) {
		update();
		setTimeout(tick, 100);
	}
}

function update() {
	var x = now === null ? 0 : moment().diff(now, 'ms');
	var h = Math.floor(x / (3600000)).toLeadingString('0', 2);
	var m = Math.floor(x / (60000) % 60).toLeadingString('0', 2);
	var s = Math.floor(x / (1000) % 60).toLeadingString('0', 2);
	var f = (x % 1000).toLeadingString('0', 3);
	$('#time-container span:first-child').text(h + ':' + m + ':' + s);
	$('#time-container span:last-child').text(f);
}

function lap() {
	if (isRunning) {
		var $time = $('<div class="time" contenteditable></div>').append($('#time-container').children().clone());
		console.log($time.text());
		var rank = ($('#rank-container ol li').length + 1).toLeadingString('0', 3);
		var $rank = $('<li></li>').append('<div class="rank" contenteditable spellcheck="false">' + (rank < 10 ? ' ' : '') + '<span class="light">#</span><span>' + rank + '</span></div>').append($time);

		if ($('#rank-container ol li').length === 0) {
			var widthRatio = $('#dial-container').data('width-ratio');
			$('#dial-container').width(widthRatio * 100 + '%');
			$('#rank-container').width((1 - widthRatio) * 100 + '%').css('zoom', 1);
			$(window).trigger('resize');

			setTimeout(function () {
				$('#rank-container ol').append($rank.hide());
				$rank.show({ effect: 'blind', direction: 'up' });
			}, 1000);

		} else {
			if ($('#rank-container ol li:first-child').outerHeight(true) * ($('#rank-container ol li').length + 1) > $('#rank-container').height()) {
				$('#rank-container').css('zoom', parseFloat($('#rank-container').css('zoom')) * 0.9);
			}

			$('#rank-container ol').append($rank.hide());
			$rank.show({ effect: 'blind', direction: 'up' });
		}
	}
}

Number.prototype.toLeadingString = function (char, length) {
	var temp = this.toString();
	while (temp.length < length) {
		temp = char + temp;
	}
	return temp;
}

function playLogo() {
	setTimeout(function () {
		var $container = $('#logo-container');
		var next = ($container.find('> *:visible').index() + 1) % $container.children().length;
		$container.find('> *:visible').fadeOut(500, function () { $container.children().eq(next).fadeIn(500); });

		playLogo();
	}, 15000);
}