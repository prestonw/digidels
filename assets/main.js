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

// Sections.
	(function() {

		var initialSection, initialScrollPoint, initialId,
			h, e, ee, k,
			locked = false,
			initialized = false,
			doScrollTop = function() {
				scrollTo(0, 0);
			},
			doScroll = function(e, instant) {

				var pos;

				// Determine position.
					switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {

						case 'default':
						default:

							pos = e.offsetTop;

							break;

						case 'center':

							if (e.offsetHeight < window.innerHeight)
								pos = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2);
							else
								pos = e.offsetTop;

							break;

						case 'previous':

							if (e.previousElementSibling)
								pos = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight;
							else
								pos = e.offsetTop;

							break;

					}

				// Scroll.
					if ('scrollBehavior' in $body.style
					&&	initialized
					&&	!instant)
						scrollTo({
							behavior: 'smooth',
							left: 0,
							top: pos
						});
					else
						scrollTo(0, pos);

			};

		// Initialize.

			// Set scroll restoration to manual.
				if ('scrollRestoration' in history)
					history.scrollRestoration = 'manual';

			// Show initial section.

				// Determine target.
					h = location.hash ? location.hash.substring(1) : null;

					// Scroll point.
						if (e = $('[data-scroll-id="' + h + '"]')) {

							initialScrollPoint = e;
							initialSection = initialScrollPoint.parentElement;
							initialId = initialSection.id;

						}

					// Section.
						else if (e = $('#' + (h ? h : 'home') + '-section')) {

							initialScrollPoint = null;
							initialSection = e;
							initialId = initialSection.id;

						}

				// Deactivate all sections (except initial).
					ee = $$('section:not([id="' + initialId + '"])');

					for (k = 0; k < ee.length; k++) {

						ee[k].className = 'inactive';
						ee[k].style.display = 'none';

					}

				// Activate initial section.
					initialSection.classList.add('active');

			 	// Scroll to top.
			 		doScrollTop();

			// Load event.
				on('load', function() {

					// Scroll to initial scroll point (if applicable).
				 		if (initialScrollPoint)
							doScroll(initialScrollPoint);

					// Mark as initialized.
						initialized = true;

				});

		// Hashchange event.
			on('hashchange', function(event) {

				var section, scrollPoint, id, sectionHeight, currentSection, currentSectionHeight,
					h, e, ee, k;

				// Lock.
					if (locked)
						return false;

				// Determine target.
					h = location.hash ? location.hash.substring(1) : null;

					// Scroll point.
						if (e = $('[data-scroll-id="' + h + '"]')) {

							scrollPoint = e;
							section = scrollPoint.parentElement;
							id = section.id;

						}

					// Section.
						else if (e = $('#' + (h ? h : 'home') + '-section')) {

							scrollPoint = null;
							section = e;
							id = section.id;

						}

					// Bail.
						else
							return false;

				// No section? Bail.
					if (!section)
						return false;

				// Section already active?
					if (!section.classList.contains('inactive')) {

					 	// Scroll to scroll point (if applicable).
					 		if (scrollPoint)
								doScroll(scrollPoint);

						// Otherwise, just scroll to top.
							else
							 	doScrollTop();

						// Bail.
							return false;

					}

				// Otherwise, activate it.
					else {

						// Lock.
							locked = true;

						// Clear "home" URL hash.
							if (location.hash == '#home')
								history.replaceState(null, null, '#');

								// Deactivate current section.
									currentSection = $('section:not(.inactive)');

									if (currentSection) {

										// Get current height.
											currentSectionHeight = currentSection.offsetHeight;

										// Deactivate.
											currentSection.classList.add('inactive');

										// Hide.
											setTimeout(function() {
												currentSection.style.display = 'none';
												currentSection.classList.remove('active');
											}, 250);

									}

								// Activate target section.
									setTimeout(function() {

										// Show.
											section.style.display = '';

										// Trigger 'resize' event.
											trigger('resize');

										// Scroll to top.
											doScrollTop();

										// Get target height.
											sectionHeight = section.offsetHeight;

										// Set target heights.
											if (sectionHeight > currentSectionHeight) {

												section.style.maxHeight = currentSectionHeight + 'px';
												section.style.minHeight = '0';

											}
											else {

												section.style.maxHeight = '';
												section.style.minHeight = currentSectionHeight + 'px';

											}

										// Delay.
											setTimeout(function() {

												// Activate.
													section.classList.remove('inactive');
													section.classList.add('active');

												// Temporarily restore target heights.
													section.style.minHeight = sectionHeight + 'px';
													section.style.maxHeight = sectionHeight + 'px';

												// Delay.
													setTimeout(function() {

														// Turn off transitions.
															section.style.transition = 'none';

														// Clear target heights.
															section.style.minHeight = '';
															section.style.maxHeight = '';

													 	// Scroll to scroll point (if applicable).
													 		if (scrollPoint)
																doScroll(scrollPoint, true);

														// Delay.
															setTimeout(function() {

																// Turn on transitions.
																	section.style.transition = '';

																// Unlock.
																	locked = false;

															}, 75);

													}, 500);

											}, 75);

									}, 250);

					}

				return false;

			});

			// Hack: Allow hashchange to trigger on click even if the target's href matches the current hash.
				on('click', function(event) {

					var t = event.target;

					// Target is an image and its parent is a link? Switch target to parent.
						if (t.tagName == 'IMG'
						&&	t.parentElement
						&&	t.parentElement.tagName == 'A')
							t = t.parentElement;

					// Target is an anchor *and* its href is a hash that matches the current hash?
						if (t.tagName == 'A'
						&&	t.getAttribute('href').substr(0, 1) == '#'
						&&	t.hash == window.location.hash) {

							// Prevent default.
								event.preventDefault();

							// Replace state with '#'.
								history.replaceState(undefined, undefined, '#');

							// Replace location with target hash.
								location.replace(t.hash);

						}

				});

	})();

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
