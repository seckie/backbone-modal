/**
 * $.Modal
 *
 * @author     Naoki Sekiguchi
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
		content: null,
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
		 * default element structure
		 * <body $body>
		 *   <div $box>
		 *     <div $boxBody>
		 *     <!-- contents here -->
		 *     </div>
		 *     <a $dismiss></a>
		 *   </div>
		 *   <div $bg> </div>
		 * </body>
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
		// elements
		this.$body = $(opt.bodyEl);
		// element - bg
		if (this.options.bg) {
			this.$bg = new Backbone.View({
				className: opt.bgClassName
			}).$el;
			this.$body.append(this.$bg);
		}
		// element - box
		this.$content = $(this.options.content);
		this.$boxBody = $('<div/>', { 'class': opt.boxBodyClassName });
		this.$dismiss = $('<a/>', { 'class': opt.dismissClassName, href: '#', html: '&#215;' });
		this.$boxBody.append(this.$content);
		this.$el.append(this.$boxBody)
			.append(this.$dismiss)
			.hide()
			.appendTo(this.$body);
		this.$content.show();

		_.bindAll(this, 'render', '_setupEvents', '_keyHandler', 'open', 'close', 'showBox', 'showBg', '_adjustBgSize');
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
			startCallback = this.action.openStart.call(this); // action
		if (startCallback && typeof startCallback.promise === 'function') {
			startCallback.done(_.bind(main, this));
		} else {
			main.call(this);
		}

		function main () {
			$(document).on('keydown.' + this.cid, this._keyHandler); // add key event
			this.showBox().done(_.bind(self.action.openComplete, self));
			this.showBg();
		}
	},
	openURL: function (url) {
		var self = this,
			opt = this.options,
			startCallback = this.action.openStart.call(this); // action
			
		if (typeof url != 'string') {
			return;
		}
		if (startCallback && typeof startCallback.promise === 'function') {
			startCallback.done(_.bind(main, this));
		} else {
			main.call(this);
		}
		
		function main () {
			$(document).on('keydown.' + self.cid, self._keyHandler); // add key event
			$.ajax(url, {
				cache: opt.cache,
				dataType: 'html',
				success: function (res) {
					var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
					body = body.replace(/<body[^>]*>\n?/, '');
					self.$boxBody.html(body);
					self.showBox().done(_.bind(self.action.openComplete, self));
					self.showBg();
				}
			});
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
			this.$boxBody.css({
				'visibility': 'hidden'
			});
			this.$el.hide();
			if (opt.resumeScrollPosition) {
				$(window).scrollTop(this.initialScrollTop);
			}
			this.hideBg().done(_.bind(this.action.closeComplete, this));
		}
	},
	showBox: function (transition) {
		var self = this,
			winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			boxH = this.$el.outerHeight(), 
			scrollTop = $(window).scrollTop(),
			dfd = $.Deferred(),
			posTop,
			show = function () {
				self.$boxBody.css({
					'visibility': 'visible'
				});
			};
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
			}, function () {
				show();
				dfd.resolve();
			});
		} else {
			this.$el.css({
				'top': posTop
			}).show();
			show();
			dfd.resolve();
		}
		return dfd.promise();
	},
	showBg: function () {
		var dfd = $.Deferred();
		if (!this.$bg) {
			dfd.resolve();
			return dfd.promise(); // skip
		}
		this._adjustBgSize();
		if (this.options.fadeDuration > 0) {
			this.$bg.fadeIn(this.options.fadeDuration, dfd.revolve);
		} else {
			this.$bg.show();
			dfd.resolve();
		}
		return dfd.promise();
	},
	hideBg: function () {
		var dfd = $.Deferred();
		if (!this.$bg) {
			dfd.resolve();
			return dfd.promise(); // skip
		}
		if (this.options.fadeDuration > 0) {
			this.$bg.fadeOut(this.options.fadeDuration, dfd.resolve);
		} else {
			this.$bg.hide();
			dfd.resolve();
		}
		return dfd.promise();
	},
	_adjustBgSize: function () {
		var winW = $(window).width(),
			winH = $(window).height(),
			bodyW = this.$body.outerWidth(),
			bodyH = this.$body.outerHeight(),
			contentW = this.$el.outerWidth(),
			contentH = this.$el.outerHeight() + $(window).scrollTop(),
			bgW = _.max([winW, bodyW, contentW]),
			bgH = _.max([winH, bodyH, contentH]);
		this.$bg.width(bgW).height(bgH);
	}
});

})(jQuery, _, Backbone, this, this.document);
