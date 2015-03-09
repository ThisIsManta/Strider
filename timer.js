console.info('version 1.2');

$(document).ready(function () {
	if ($('#logo-container').children().length > 1) {
		$('#logo-container').children().wrap('<div></div>');
		$('#logo-container').children().hide().eq(0).show();
		playLogo();
	}

	$('#time-button').on('click', function (e) {
		time();

		$(e.currentTarget).blur();
		e.preventDefault();
	});

	$('#lap-button').on('click', function (e) {
		if (e.currentTarget.textContent.trim().toUpperCase() === 'PUBLISH') {
			publish();
		} else {
			lap();
		}

		$(e.currentTarget).blur();
		e.preventDefault();
	});
	
	$(window).trigger('resize');
});

$(window).on('resize', function () {
	var widthRatio = $('#dial-container').data('width-ratio');
	var availWidth = $(window).width();
	var availHeight = $(window).height();

	$('#logo-container img').css('max-width', (widthRatio * availWidth * 0.05) + 'em').css('max-height', Math.round(Math.min(availWidth, availHeight) * 0.311) + 'px');
	$('#logo-container').css('height', $('#logo-container img').css('max-height'));
	$('#time-container').css('font-size', (widthRatio * availWidth * 0.0083) + 'em');
	$('#rank-container').css('font-size', ((1 - widthRatio) * availWidth * 0.0063) + 'em');
});

console.info('type "help()" and press enter to see the list of useful functions');

// console.info('Enter or Alt+S = Start/Stop/Reset');
// console.info('Space or Alt+Q = Capture');
// console.info('         Alt+T = Show/Hide timer');
// console.info('           F11 = Go full screen');

$(document).on('keyup', function (e) {
	if (e.keyCode === 13 /* Enter */ || e.altKey && e.keyCode === 83 /* S */) {
		time();

	} else if (e.keyCode === 32 /* Space */ || e.altKey && e.keyCode === 76 /* Q */) {
		lap();

	} else if (e.altKey && e.keyCode === 84 /* T */) {
		$('#time-container, #button-container').toggle({ effect: 'pulsate', times: 3 });
	}
});

var now = null;
var isRunning = false;

function time() {
	if (isRunning) {
		isRunning = false;
		$('#time-container').css('color', 'red');
		$('#time-button').text('Reset').css('background', 'firebrick');
		$('#lap-button').text('Publish').attr('disabled', lastRank > 0 ? null : true);

	} else if (now !== null) {
		lastRank = 0;
		console.log('---')
		now = null;
		update();
		$('#time-container').css('color', '');
		$('#time-button').text('Start').css('background', '');
		$('#dial-container').show().width('100%');
		$('#rank-container').width('0%').find('ol').empty();
		$('#lap-button').text('Capture').attr('disabled', true);
		
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

var lastRank = 0;

function lap() {
	if (isRunning) {
		var $time = $('<div class="time"></div>').append($('#time-container').children().clone());
		console.log($time.text());
		var rank = (lastRank + 1).toLeadingString('0', 3);
		var $rank = $('<li></li>').append('<div class="rank" contenteditable spellcheck="false">' + (rank < 10 ? ' ' : '') + '<span class="light">#</span><span>' + rank + '</span></div>').append($time);

		if (lastRank === 0) {
			var widthRatio = $('#dial-container').data('width-ratio');
			$('#dial-container').width(widthRatio * 100 + '%');
			$('#rank-container').width((1 - widthRatio) * 100 + '%').css('zoom', 1);
			$(window).trigger('resize');

			setTimeout(function () {
				$('#rank-container ol').prepend($rank.hide());
				$rank.show({ effect: 'blind', direction: 'up' });
			}, 1000);

		} else {
			if ($('#rank-container ol li:first-child').outerHeight(true) * ($('#rank-container ol li').length + 1) > $('#rank-container').height()) {
				$('#rank-container').css('zoom', parseFloat($('#rank-container').css('zoom')) * 0.9);
			}

			$('#rank-container ol').append($rank.hide());
			$rank.show({ effect: 'blind', direction: 'up' });
		}

		lastRank += 1;
	}
}

function publish() {
	var targetSheetId = '1IuETigIVdGN9GVWaVuhg_Z1LSiUEucXPbuuB6PsI8Ow'; // Google Spreadsheet ID; It is XXX in the URL https://docs.google.com/spreadsheets/d/XXX/edit
	var targetKeyColumnIndex = 4; // The one-based column index (column A is 1, B is 2 and so on) that contains running code
	var targetValueColumnIndex = 5; // The one-based column index (column A is 1, B is 2 and so on) that is to be replaced by time code (HH:mm:ss.SSS)
	var targetNameColumnIndex = 2; // The one-based column index (column A is 1, B is 2 and so on) that contains competitor name

	if (lastRank > 0) {
		$('#lap-button').attr('disabled', true);
		
		$.ajax({
			url: 'https://script.google.com/macros/s/AKfycbwapJlU2tlNLgTQ3ts0qVayv7uybDvZe5R7kox1vhOhF3FOA-I/exec?book=' + encodeURIComponent(targetSheetId) + '&key=' + targetKeyColumnIndex + '&value=' + targetValueColumnIndex + '&name=' + targetNameColumnIndex + '&numbs=' + encodeURIComponent(new Enumerable($('#rank-container ol li .rank')).select(function (current) { return current.textContent.trim() }).toString(',')) + '&times=' + encodeURIComponent(new Enumerable($('#rank-container ol li .time')).select(function (current) { return current.textContent.trim() }).toString(',')),
			type: 'GET',
			dataType: 'jsonp',
			contentType: 'application/javascript',
			crossDomain: true
		});
		console.log('waiting for the publishing result...');
		
	} else {
		console.log('nothing will be published');
	}
}

function afterPublish(data) {
	if (data.status === 'success') {
		console.log('published with ' + data.affectedRowNumber + ' affected row(s)');
		
		if (Array.isArray(data.names)) {
			new Enumerable(data.names).invoke(function (name, index) {
				$('<div class="name thai">' + (name || '') + '</div>').insertAfter('#rank-container ol li:eq(' + index + ') .rank');
			});
			
			if ($('#rank-container').width() > 0) {
				$('#dial-container').hide();
			}
		}
		
	} else {
		console.error(data.error);
	}
	
	$('#lap-button').attr('disabled', null);
}

function shrink(rank) {
	rank = parseInt(rank) - 1;
	$('#rank-container ol li:eq(' + rank + ')').remove();
	rank--;
	while (++rank < $('#rank-container ol li').length) {
		var $temp = $('#rank-container ol li:eq(' + rank + ') .rank');
		if ($temp.text().trim().indexOf('#') === 0) {
			$temp.find('span:last-child').text((rank + 1).toLeadingString('0', 3));
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

var isPlayingLogo = true;

function playLogo() {
	setTimeout(function () {
		if (isPlayingLogo) {
			var $container = $('#logo-container');
			var next = ($container.find('> *:visible').index() + 1) % $container.children().length;
			$container.find('> *:visible').fadeOut(500, function () { $container.children().eq(next).fadeIn(500); });
			
			playLogo();
		}
	}, 15000);
}