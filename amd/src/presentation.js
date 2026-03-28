// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Add navigation functionality to slideshow.
 *
 * @module      mod_slideshow/presentation
 * @copyright   2025 Josemaria Bolanos <admin@mako.digital>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([
    'mod_slideshow/qrcode',
    'core/notification',
    'core/str'
], function(QRCode, Notification, Str) {
    const Selectors = {
        // Only direct children of the container (avoids .slide divs inside slide content).
        slides: ':scope > .slide',
        prev: '.prev',
        next: '.next',
        currentSlide: '.currentslide',
        fontsize: '.fontsize',
        overlay: '.overlay',
        scantoenrol: '.scantoenrol',
        qrcode: '.qrcode',
        fullscreen: '.fullscreen',
        editslide: '.editslide',
    };

    return {
        /**
         * Initialize module
         * @param {Object} options Configuration options
         * @param {Number} options.cmid The course module id to setup for
         */
        init: function(options) {
            Str.get_strings([
                {key: 'errorcontainernotfound', component: 'mod_slideshow'},
                {key: 'fullscreennotsupported', component: 'mod_slideshow'},
                {key: 'fullscreenexitnotsupported', component: 'mod_slideshow'},
                {key: 'error', component: 'moodle'},
                {key: 'warning', component: 'moodle'},
            ]).done(function(s) {
                const strContainerNotFound = s[0];
                const strFsNotSupported = s[1];
                const strFsExitNotSupported = s[2];
                const strError = s[3];
                const strWarning = s[4];

                let container = document.querySelector('#slideshow-' + options.cmid);
                if (!container) {
                    Notification.alert(strContainerNotFound, null, strError);
                    return;
                }

                let slides = container.querySelectorAll(Selectors.slides);
                let total = slides.length;
                let current = 0;

                // Navigation buttons
                let prev = container.querySelector(Selectors.prev);
                let next = container.querySelector(Selectors.next);
                let currentslide = container.querySelector(Selectors.currentSlide);
                let overlay = container.querySelector(Selectors.overlay);
                let scantoenrol = overlay.querySelector(Selectors.scantoenrol);
                let fontsize = container.querySelector(Selectors.fontsize);
                let fullscreen = container.querySelector(Selectors.fullscreen);

                // Edit slide button
                let editslide = document.querySelector(Selectors.editslide);

                // Set width and height for the QR Code container
                overlay.setAttribute(
                    'style',
                    'width: ' + container.offsetWidth + 'px; height: ' + container.offsetWidth * (9 / 16) + 'px;'
                );

                // Hide overlay on click
                overlay.addEventListener('click', () => {
                    overlay.classList.toggle('hidden');
                });

                // Enrol URL is set, add QR logic
                if (options.enrolurl) {
                    let qrcode = container.querySelector(Selectors.qrcode);

                    // Toggle overlay button
                    qrcode.addEventListener('click', () => {
                        overlay.classList.toggle('hidden');
                    });

                    // Generate QR code
                    new QRCode(scantoenrol, {
                        text: options.enrolurl,
                        width: container.offsetHeight * 0.4,
                        height: container.offsetHeight * 0.4,
                    });
                }

                // Navigate slides with arrow keys
                document.addEventListener('keyup', (e) => {
                    if (isFullscreenActive()) {
                        if (e.key === 'ArrowLeft') {
                            prevSlide();
                        }
                        if (e.key === 'ArrowRight') {
                            nextSlide();
                        }
                    }
                });

                // Check if fullscreen is supported
                if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
                    fullscreen.classList.add('hidden');
                }

                // Listen for fullscreen change event
                document.addEventListener('fullscreenchange', () => {
                    if (isFullscreenActive()) {
                        container.classList.add('fullscreen');
                        fontsize.value = '300';
                    } else {
                        container.classList.remove('fullscreen');
                        fontsize.value = '150';
                    }
                    fontsize.dispatchEvent(new Event('input', {bubbles: true}));
                    updateSlideDimensions();
                });

                // Previous slide button
                prev.addEventListener('click', () => {
                    prevSlide();
                });

                // Navigate to the previous slide
                const prevSlide = () => {
                    if (current > 0) {
                        slides[current].classList.add('hidden');
                        slides[current - 1].classList.remove('hidden');
                        current--;
                        updateCurrentSlide();
                    }
                };

                // Next slide button
                next.addEventListener('click', () => {
                    nextSlide();
                });

                // Navigate to the next slide
                const nextSlide = () => {
                    if (current < total - 1) {
                        slides[current].classList.add('hidden');
                        slides[current + 1].classList.remove('hidden');
                        current++;
                        updateCurrentSlide();
                    }
                };

                // Fullscreen button
                fullscreen.addEventListener('click', () => {
                    if (isFullscreenActive()) {
                        exitFullscreenSafe();
                    } else {
                        requestFullscreenSafe(container);
                    }
                });

                // Font size slider: set base font-size on container so all slide content
                // scales together while preserving relative sizes (h1, h2, h3, p, etc.).
                fontsize.addEventListener('input', function() {
                    container.style.setProperty('font-size', this.value + '%');

                    let images = slides[current].querySelectorAll('img');
                    let scale = this.value / 100;
                    images.forEach(img => {
                        img.style.width = (img.naturalWidth * scale) + 'px';
                    });
                });

                // Edit slide button
                editslide.addEventListener('click', () => {
                    editSlide();
                });

                // Navigate to edit page for the current slide
                const editSlide = () => {
                    let slideid = slides[current].getAttribute('data-slideid');
                    window.location.href = '/mod/slideshow/edit.php?cm=' + options.cmid + '&id=' + slideid;
                };

                // Set the current slide indicator
                const updateCurrentSlide = () => {
                    currentslide.innerText = (current + 1) + '/' + total;
                    if (current === 0) {
                        prev.classList.add('disabled');
                    } else {
                        prev.classList.remove('disabled');
                    }
                    if (current === total - 1) {
                        next.classList.add('disabled');
                    } else {
                        next.classList.remove('disabled');
                    }
                };

                // Resize slide to keep a 16:9 aspect ratio
                window.addEventListener('resize', () => {
                    updateSlideDimensions();
                }, true);

                /**
                 * Updates the height of the slide container based on the current slide's width.
                 * The height is set to maintain a 16:9 aspect ratio.
                 */
                const updateSlideDimensions = () => {
                    // QR Code overlay
                    overlay.setAttribute(
                        'style',
                        'width: ' + container.offsetWidth + 'px; height: ' + container.offsetWidth * (9 / 16) + 'px;'
                    );

                    // Slides
                    slides.forEach(slide => {
                        slide.setAttribute('style', 'height: ' + container.offsetWidth * (9 / 16) + 'px;');
                    });
                };

                // Set inital slide dimensions
                updateSlideDimensions();

                /**
                 * Requests fullscreen mode for the given element using the appropriate browser-specific API.
                 * Falls back to vendor-prefixed methods for compatibility with older browsers.
                 * Logs a warning if the Fullscreen API is not supported.
                 *
                 * @param {HTMLElement} elem - The DOM element to display in fullscreen mode.
                 */
                const requestFullscreenSafe = (elem) => {
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) { // Safari and iOS
                        elem.webkitRequestFullscreen();
                    } else if (elem.mozRequestFullScreen) { // Firefox
                        elem.mozRequestFullScreen();
                    } else if (elem.msRequestFullscreen) { // IE/Edge
                        elem.msRequestFullscreen();
                    } else {
                        Notification.alert(strFsNotSupported, null, strWarning);
                    }
                };

                /**
                 * Exits fullscreen mode in a cross-browser compatible way.
                 * Attempts to use the appropriate method for the current browser,
                 * and logs a warning if fullscreen exit is not supported.
                 */
                const exitFullscreenSafe = () => {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) { // Safari
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) { // Firefox
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) { // IE/Edge
                        document.msExitFullscreen();
                    } else {
                        Notification.alert(strFsExitNotSupported, null, strWarning);
                    }
                };

                /**
                 * Checks if the document is currently in fullscreen mode.
                 *
                 * This function accounts for different browser-specific fullscreen implementations.
                 *
                 * @returns {boolean} True if fullscreen mode is active, false otherwise.
                 */
                const isFullscreenActive = () => {
                    return !!(
                        document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement
                    );
                };
            });
        }
    };
});

