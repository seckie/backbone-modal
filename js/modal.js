/**
 * $.Modal
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/Backbone-View-Modal
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
 */

(function($, _, Backbone, window, document) {

$.Modal = Backbone.View.extend({
	options: {
//        slideEl: '.slide',
//        animateDuration: 750,
//        animateEasing: 'swing',
		width: null,
		cache: true,
		boxClassName: 'modal-box',
		boxBodyClassName: 'modal-body',
		bgClassName: 'modal-bg',
		innerLinkSelector: null,
		dismissEl: '.dismiss',
		bodyEl: document.body,
		action: { }
	},
	events: {
//        'click': '_openModal',
//        'click .prev': '_scrollPrev',
//        'click .controll a': '_jump'
	},
	initialize: function (options) {
		var opt = this.options;
		var id, url;
		_.extend(this.options, options);
		_.extend(this.action, opt.action);

		// element
		// - bg
		if (typeof $('.' + opt.bgClassName)[0] != 'object') {
			this.$bg = new Backbone.View({
				className: this.options.bgClassName
			}).$el;
		}
		// - box
		id = this.$el.data('modal-id');
		url = this.$el.data('modal-url');
		this.$box;

		if (typeof id === 'string') { // id mode
			this.$box = $('#' + id);
		} else if (!this.$box && typeof url === 'string') { // url mode
			this.$box = new Backbone.View({
				className: this.options.boxClassName
			}).$el;
			this.$box.appendTo(document.body);
		}
		this.$boxBody = $('<div/>', { 'class': opt.boxBodyClassName });

		/*
		if (!this.container[0]) {
			this.container = $('<div/>', {
					'class': this.containerClassName
				}).hide().appendTo(document.body);
			this.inner = $('<div/>', {
					'class': this.containerClassName + '_inner'
				}).appendTo(this.container);
		}
		this.body = $(this.bodyEl);
		this.closeBtn = $(this.dismissEl);

		this.isIE7 = ($.browser.msie && $.browser.version < 8);
		var url = this.$el.attr('href');

		// bind event
		this.$el.bind('click', $.proxy(function (e) {
			this._openModal(url);
			$(document).bind('keydown.smb', $.proxy(this._keyEventHandler, this));
			e.preventDefault();
		}, this));

		// property
		this.action.initComplete.call(this);
		*/

		this.render();
	},
	render: function () {
		this.action.renderComplete.call(this);
	},
	// close modal with Esc key
	_keyEventHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key == 27) {
			this._closeModal();
			$(document).unbind('keydown.smb');
		}
	},

	_bindContentEvents: function () {
		var self = this;
		// close button
		$(this.dismissEl).bind('click', function (e) {
			self._closeModal();
			$(document).unbind('keydown.smb');
			e.preventDefault();
		});
		// bg
		this.$bg.unbind('click').bind('click', function (e) {
			self._closeModal();
			$(document).unbind('keydown.smb');
			e.preventDefault();
		});
		// inner link
		if (this.innerLinkSelector) {
			$(this.innerLinkSelector).bind('click', function (e) {
				var href = $(this).attr('href');
				if (!href) { return; }
				self._openInside(href);
				e.preventDefault();
			});
		}
	},

	_openModal: function (url) {
		var cacheCtrl = this.cache ? '' : '?d=' + (new Date()).getTime();
		if (this.width) {
			this.container.css({
				'width': this.width,
				'margin-left': Math.floor(this.width / 2) * -1
			});
		} else {
			this.container.css({
				'width': '',
				'margin-left': ''
			});
		}
		this.inner.load(url + cacheCtrl, $.proxy(function() {
			this._initContainer();
			this._showBg();
			this._showContainer();
			this._bindContentEvents();
		}, this));
	},

	_closeModal: function () {
		this.inner.empty();
		this.container.hide();
		$(window).scrollTop(this.initialScrollTop);
		if (this.isIE7) {
			this.$bg.hide();
			this.closeCallback();
		} else {
			this.$bg.fadeOut($.proxy(function() {
				this.closeCallback();
			}, this));
		}
	},

	_initContainer: function () {
		var winHeight = $(window).height(),
			scrollTop = $(window).scrollTop();
		if (winHeight < scrollTop
				&& this.body.outerHeight() < scrollTop) {
			// prevent too much increase of height
		} else {
			this.initialScrollTop = scrollTop;
		}

		var posTop = (this.container.outerHeight() < winHeight) ?
			this.initialScrollTop + Math.floor((winHeight - this.container.outerHeight()) / 2) :
			this.initialScrollTop;

		this.container.css({
			'top': posTop
		}).show();
		this.inner.css({
			'visibility': 'hidden'
		});
	},

	_showContainer: function () {
		this.inner.css({
			'visibility': 'visible'
		});
	},

	_showBg: function () {
		this._adjustBgSize();
		if (this.isIE7) {
			this.$bg.show();
		} else {
			this.$bg.fadeIn();
		}
	},

	_adjustBgSize: function () {
		this.$bg.width(this._getBgWidth()).height(this._getBgHeight());
	},

	_getBgWidth: function () {
		var winWidth = $(window).width(),
			bodyWidth = this.body.outerWidth(),
			contentWidth = this.container.outerWidth();
		return _.max([winWidth, bodyWidth, contentWidth]);
	},

	_getBgHeight: function () {
		var winHeight = $(window).height(),
			bodyHeight = this.body.outerHeight(),
			contentHeight = this.container.outerHeight() + $(window).scrollTop();
		return _.max([winHeight, bodyHeight, contentHeight]);
	},

	_openInside: function (url) {
		var cacheCtrl = this.cache ? '' : '?d=' + (new Date()).getTime();
		this.inner.load(url + cacheCtrl, $.proxy(function() {
			// for fadeIn effect
			this.container.height(this.container.height());
			this.inner.hide();

			this._adjustBgSize();
			this._initContainer();
			$(window).scrollTop(this.initialScrollTop);
			this._showContainer();
			this._bindContentEvents();

			// fadeIn effect
			if (this.isIE7) {
				this.inner.show();
			} else {
				this.inner.fadeIn();
			}
			this.container.css('height', '');
		}, this));
	},

	// interface functions that should be overridden
	action: {
		initComplete: function () { },
		renderComplete: function () { },
		openComplete: function () {},
		closeComplete: function () {}
	}
});

})(jQuery, _, Backbone, this, this.document);
