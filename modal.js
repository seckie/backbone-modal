/**
 * $.Modal
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/backbone-modal
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
 */

(function($, _, Backbone, window, document) {

$.Modal = Backbone.View.extend({
	id: null,
	tagName: 'div',
	className: 'modal-box',
	options: {
		url: null,
		cache: true,
		boxBodyClassName: 'modal-body',
		bgClassName: 'modal-bg',
		innerLinkEl: null,
		dismissClassName: 'dismiss',
		bodyEl: document.body,
		fadeDuration: 750,
		bg: true,
		resumeScrollPosition: true,
		action: { }
	},
	initialize: function (options) {
		/**
		 * <div $body>
		 *   <div $box>
		 *     <div $boxBody> </div>
		 *   </div>
		 *   <div $bg> </div>
		 *   <button $dismiss></button>
		 * </div>
		 */
		var opt = this.options;
		_.extend(this.options, options);
		// interface functions that should be overridden
		this.action = {
			initComplete: function () {},
			renderComplete: function () {},
			openStart: function () {},
			openComplete: function () {},
			closeStart: function () {},
			closeComplete: function () {}
		};
		_.extend(this.action, opt.action);
		// element - bg
		if (this.options.bg) {
			this.$bg = new Backbone.View({
				className: opt.bgClassName
			}).$el;
			this.$bg.appendTo(document.body);
		}
		// element - box
		if (typeof this.id === 'string') { // id mode
			this.$el = $('#' + this.id).hide();
			this.$boxBody = this.$('.' + opt.boxBodyClassName);
			this.$dismiss = this.$('.' + opt.dismissClassName);
		} else if (typeof opt.url === 'string') { // url mode
			this.$el = new Backbone.View({
				tagName: this.tagName,
				className: this.className
			}).$el;
			this.$boxBody = $('<div/>', { 'class': opt.boxBodyClassName }).appendTo(this.$el);
			this.$dismiss = $('<a/>', { 'class': opt.dismissClassName, href: '#', html: '&#215;' }).appendTo(this.$el);
			this.$el.hide().appendTo(document.body);
		}
		this.$body = $(opt.bodyEl);

		_.bindAll(this, 'render', '_setupEvents', '_keyHandler', 'open', 'close', '_initBox', '_hideBoxBody', '_showBoxBody', '_showBg', '_adjustBgSize', '_getBgWidth', '_getBgHeight');
		this._setupEvents();
		this.action.initComplete.call(this); // action
		this.render(options);
	},
	render: function (options) {
		this.action.renderComplete.call(this); // action
	},
	_setupEvents: function () {
		var opt = this.options;
		if (this.$bg) {
			this.$bg.on('click.' + this.cid, this.close);
		}
		this.$el.on('click.' + this.cid, '.' + opt.dismissClassName, this.close);
	},
	// close modal with Esc key
	_keyHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key === 27) {
			this.close(e);
		}
	},
	open: function (url) { // public function
		var self = this,
			opt = this.options,
			url = url || opt.url,
			startCallback = this.action.openStart.call(this); // action
		if (startCallback && typeof startCallback.promise === 'function') {
			startCallback.done(_.bind(main, this));
		} else {
			main.call(this);
		}

		function main () {
			$(document).on('keydown.' + this.cid, this._keyHandler); // add key event
			if (typeof url === 'string') { // open via URL
				$.ajax(url, {
					cache: opt.cache,
					dataType: 'html',
					success: _.bind(openModal, this)
				});
			} else { // open via id
				openModal.call(this);
			}
		}

		function openModal (res) {
			if (res) { // open via URL
				var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
				body = body.replace(/<body[^>]*>\n?/, '');
				this.$boxBody.html(body);
			}
			this._initBox().done(function () {
				self._showBoxBody();
				self.action.openComplete.call(self); // action
			});
			if (this.$bg) { // if 'bg' option is TRUE
				this._showBg();
			}
		}
	},
	close: function (e) { // public function
		var opt = this.options,
			startCallback = this.action.closeStart.call(this); // action
		if (startCallback && typeof startCallback.promise === 'function') {
			startCallback.done(_.bind(main, this));
		} else {
			main.call(this);
		}
		if (e) {
			e.preventDefault();
		}

		function main () {
			$(document).off('keydown.' + this.cid); // remove key event
			this._hideBoxBody();
			this.$el.hide();
			if (opt.resumeScrollPosition) {
				$(window).scrollTop(this.initialScrollTop);
			}
			if (this.options.fadeDuration > 0) {
				if (this.$bg) {
					this.$bg.fadeOut(opt.fadeDuration, _.bind(this.action.closeComplete, this)/* action */);
				}
			} else {
				if (this.$bg) {
					this.$bg.hide();
				}
				this.action.closeComplete.call(this);/* action */
			}
		}
	},
	_initBox: function (transition) {
		var winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			boxH = this.$el.outerHeight(), 
			scrollTop = $(window).scrollTop(),
			dfd = $.Deferred(),
			posTop;
		if (winH < scrollTop && bodyH < scrollTop) {
			// prevent too much increase of height
		} else {
			// save scroll position
			this.initialScrollTop = scrollTop;
		}

		if (this.$el.outerHeight() < winH) {
			// small box height
			posTop = this.initialScrollTop + Math.floor((winH - boxH) / 2);
		} else {
			// large box height
			posTop = this.initialScrollTop;
		}
		if (transition) {
			this.$el.show().animate({
				'top': posTop
			}, dfd.resolve);
		} else {
			this.$el.css({
				'top': posTop
			}).show();
			dfd.resolve();
		}
		return dfd.promise();
	},
	_hideBoxBody: function () {
		this.$boxBody.css({
			'visibility': 'hidden'
		});
	},
	_showBoxBody: function () {
		this.$boxBody.css({
			'visibility': 'visible'
		});
	},
	_showBg: function () {
		this._adjustBgSize();
		if (this.options.fadeDuration > 0) {
			this.$bg.fadeIn(this.options.fadeDuration);
		} else {
			this.$bg.show();
		}
	},
	_adjustBgSize: function () {
		this.$bg.width(this._getBgWidth()).height(this._getBgHeight());
	},
	_getBgWidth: function () {
		var winW = $(window).width(),
			bodyW = this.$body.outerWidth(),
			contentW = this.$el.outerWidth();
		return _.max([winW, bodyW, contentW]);
	},
	_getBgHeight: function () {
		var winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			contentH = this.$el.outerHeight() + $(window).scrollTop();
		return _.max([winH, bodyH, contentH]);
	}
});

})(jQuery, _, Backbone, this, this.document);
