/* Carrd Core JS | carrd.co | License: MIT */

var	on = addEventListener,
	$ = function(q) { return document.querySelector(q) },
	$$ = function(q) { return document.querySelectorAll(q) },
	$body = document.body,
	$inner = $('.inner'),
	client = (function() {

		var o = {
				browser: 'other',
				browserVersion: 0,
				os: 'other',
				osVersion: 0
			},
			ua = navigator.userAgent,
			a, i;

		// browser, browserVersion.
			a = [
				['firefox',		/Firefox\/([0-9\.]+)/],
				['edge',		/Edge\/([0-9\.]+)/],
				['safari',		/Version\/([0-9\.]+).+Safari/],
				['chrome',		/Chrome\/([0-9\.]+)/],
				['ie',			/Trident\/.+rv:([0-9]+)/]
			];

			for (i=0; i < a.length; i++) {

				if (ua.match(a[i][1])) {

					o.browser = a[i][0];
					o.browserVersion = parseFloat(RegExp.$1);

					break;

				}

			}

		// os, osVersion.
			a = [
				['ios',			/([0-9_]+) like Mac OS X/,			function(v) { return v.replace('_', '.').replace('_', ''); }],
				['ios',			/CPU like Mac OS X/,				function(v) { return 0 }],
				['android',		/Android ([0-9\.]+)/,				null],
				['mac',			/Macintosh.+Mac OS X ([0-9_]+)/,	function(v) { return v.replace('_', '.').replace('_', ''); }],
				['windows',		/Windows NT ([0-9\.]+)/,			null]
			];

			for (i=0; i < a.length; i++) {

				if (ua.match(a[i][1])) {

					o.os = a[i][0];
					o.osVersion = parseFloat( a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1 );

					break;

				}

			}

		return o;

	}()),
	trigger = function(t) {

		if (client.browser == 'ie') {

			var e = document.createEvent('Event');
			e.initEvent(t, false, true);
			dispatchEvent(e);

		}
		else
			dispatchEvent(new Event(t));

	};

// Animation.
	on('load', function() {
		setTimeout(function() {
			$body.className = $body.className.replace(/\bis-loading\b/, 'is-playing');

			setTimeout(function() {
				$body.className = $body.className.replace(/\bis-playing\b/, 'is-ready');
			}, 1250);
		}, 100);
	});

// Platform-specific hacks.

	// Init.
		var style, sheet, rule;

		// Create <style> element.
			style = document.createElement('style');
			style.appendChild(document.createTextNode(''));
			document.head.appendChild(style);

		// Get sheet.
			sheet = style.sheet;

	// Android.
		if (client.os == 'android') {

			// Prevent background "jump" when address bar shrinks.
			// Specifically, this fix forces the background pseudoelement to a fixed height based on the physical
			// screen size instead of relying on "vh" (which is subject to change when the scrollbar shrinks/grows).
				(function() {

					// Insert and get rule.
						sheet.insertRule('body::after { }', 0);
						rule = sheet.cssRules[0];

					// Event.
						var f = function() {
							rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
						};

						on('load', f);
						on('orientationchange', f);
						on('touchmove', f);

				})();

		}

	// iOS.
		else if (client.os == 'ios') {

			// Prevent white bar below background when address bar shrinks.
			// For some reason, simply forcing GPU acceleration on the background pseudoelement fixes this.
				(function() {

					// Insert and get rule.
						sheet.insertRule('body::after { }', 0);
						rule = sheet.cssRules[0];

					// Set rule.
						rule.style.cssText = '-webkit-transform: scale(1.0)';

				})();

			// Prevent white bar below background when form inputs are focused.
			// Fixed-position elements seem to lose their fixed-ness when this happens, which is a problem
			// because our backgrounds fall into this category.
				(function() {

					// Insert and get rule.
						sheet.insertRule('body.ios-focus-fix::before { }', 0);
						rule = sheet.cssRules[0];

					// Set rule.
						rule.style.cssText = 'height: calc(100% + 60px)';

					// Add event listeners.
						on('focus', function(event) {
							$body.classList.add('ios-focus-fix');
						}, true);

						on('blur', function(event) {
							$body.classList.remove('ios-focus-fix');
						}, true);

				})();

		}

	// IE.
		else if (client.browser == 'ie') {

			// Flexbox workaround.
			// IE's flexbox implementation doesn't work when 'min-height' is used, so we can work around this
			// by switching to 'height' but simulating the behavior of 'min-height' via JS.
				(function() {
					var t, f;

					// Handler function.
						f = function() {

							var mh, h, s, xx, x, i;

							// Wrapper.
								x = $('#wrapper');

								x.style.height = 'auto';

								if (x.scrollHeight <= innerHeight)
									x.style.height = '100vh';

							// Containers with full modifier.
								xx = $$('.container.full');

								for (i=0; i < xx.length; i++) {

									x = xx[i];
									s = getComputedStyle(x);

									// Get min-height.
										x.style.minHeight = '';
										x.style.height = '';

										mh = s.minHeight;

									// Get height.
										x.style.minHeight = 0;
										x.style.height = '';

										h = s.height;

									// Zero min-height? Do nothing.
										if (mh == 0)
											continue;

									// Set height.
										x.style.height = (h > mh ? 'auto' : mh);

								}

						};

					// Do an initial call of the handler.
						(f)();

					// Add event listeners.
						on('resize', function() {

							clearTimeout(t);

							t = setTimeout(f, 250);

						});

						on('load', f);

				})();

		}

// Background.
	var	$bg, $video,
		autoplay = (function() {
	
			// Windows or Mac? OK.
				if (client.os == 'windows'
				||	client.os == 'mac')
					return true;
	
			// Check OS.
				switch (client.os) {
	
					case 'ios':
	
						if (client.osVersion >= 10
						&& (client.browser == 'safari' || client.browser == 'chrome'))
							return true;
	
						break;
	
					case 'android':
	
						if ((client.browser == 'chrome' && client.browserVersion >= 54)
						||	(client.browser == 'firefox' && client.browserVersion >= 49))
							return true;
	
						break;
	
					default:
						break;
	
				}
	
			// Fail for everyone else.
				return false;
	
		}());
	
	// Create bg.
		$bg = document.createElement('div');
			$bg.id = 'bg';
			$body.insertBefore($bg, $body.firstChild);
	
	// Autoplay allowed? Use <video> element.
		if (autoplay) {
	
			$video = document.createElement('video');
				$video.src = 'assets/videos/bg.mp4';
				$video.autoplay = true;
				$video.muted = true;
				$video.loop = true;
				$video.playsInline = true;
				$bg.appendChild($video);
	
			// Edge + IE: Workaround for object-fit.
				if (client.browser == 'edge'
				||	client.browser == 'ie') {
	
					$video.addEventListener('loadeddata', function() {
	
						var t, f;
	
						// Handler function.
							var f = function() {
	
								var w = $video.videoWidth, h = $video.videoHeight,
									pw = $bg.clientWidth, ph = $bg.clientHeight,
									nw, nh, x;
	
								// Calculate new width, height.
									if (pw > ph) {
	
										nw = pw;
										nh = (nw / w) * h;
	
									}
									else {
	
										nh = ph;
										nw = (nh / h) * w;
	
									}
	
								// Set width, height.
									if (nw < pw) {
	
										$video.style.width = '100%';
										$video.style.height = 'auto';
	
									}
									else
										$video.style.width = nw + 'px';
	
									if (nh < ph) {
										$video.style.height = '100%';
										$video.style.width = 'auto';
									}
									else
										$video.style.height = nh + 'px';
	
								// Set position (center).
									$video.style.top = $video.style.bottom = $video.style.left = $video.style.right = 'auto';
									$video.style.top = 'calc(50% - ' + ($video.clientHeight / 2) + 'px)';
									$video.style.left = 'calc(50% - ' + ($video.clientWidth / 2) + 'px)';
	
							};
	
						// Do an initial call of the handler.
							(f)();
	
						// Add event listeners.
							on('resize', function() {
	
								clearTimeout(t);
	
								t = setTimeout(f, 125);
	
							});
	
					});
	
				}
	
		}
	
	// Otherwise, use fallback image.
		else
			$bg.style.backgroundImage = 'url(\'assets/videos/bg.mp4.jpg\')';
