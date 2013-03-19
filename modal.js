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
			openInsideStart: function () {},
			openInsideComplete: function () {},
			closeStart: function () {},
			closeComplete: function () {}
		};
		_.extend(this.action, opt.action);
		// element - bg
		this.$bg = new Backbone.View({
			className: opt.bgClassName
		}).$el;
		this.$bg.appendTo(document.body);
		// element - box
		if (typeof this.id === 'string') { // id mode
			this.$el = $('#' + this.id).hide();
			this.$boxBody = this.$el.find('.' + opt.boxBodyClassName);
			this.$dismiss = this.$el.find('.' + opt.dismissClassName);
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

		_.bindAll(this);
		this._setupEvents();
		this.action.initComplete.call(this); // action
		this.render();
	},
	render: function () {
		this.action.renderComplete.call(this); // action
	},
	_setupEvents: function () {
		var opt = this.options;
		this.$bg.on('click.' + this.cid, this.close);
		this.$el.on('click.' + this.cid, '.' + opt.dismissClassName, this.close);
		if (typeof opt.innerLinkEl === 'string') {
			$(document).on('click.' + this.cid, opt.innerLinkEl, this._openInside);
		}
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
			url = url || opt.url;
		this.action.openStart.call(this); // action
		$(document).on('keydown.' + this.cid, this._keyHandler); // add key event
		if (typeof url === 'string') { // open via URL
			$.ajax(url, {
				cache: opt.cache,
				dataType: 'html',
				success: _.bind(fire, this)
			});
		} else { // open via id
			fire.call(this);
		}

		function fire (res) {
			if (res) {
				var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
				body = body.replace(/<body[^>]*>\n?/, '');
				this.$boxBody.html(body);
			}
			this._initBox().done(function () {
				self._showBoxBody();
				self.action.openComplete.call(self); // action
			});
			this._showBg();
		}
	},
	close: function (e) { // public function
		var opt = this.options;
		this.action.closeStart.call(this); // action
		$(document).off('keydown.' + this.cid); // remove key event
		this._hideBoxBody();
		this.$el.hide();
		$(window).scrollTop(this.initialScrollTop);
		this.$bg.fadeOut(_.bind(this.action.closeComplete, this)/* action */);
		e.preventDefault();
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
			// save scrll position
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
		this._hideBoxBody();
		return dfd.promise();
	},
	_hideBoxBody: function () {
		this.$boxBody.css({
			'visibility': 'hidden',
			'opacity': 0
		});
	},
	_showBoxBody: function () {
		this.$boxBody.css({
			'visibility': 'visible',
			'opacity': 0
		}).animate({
			'opacity': 1
		});
	},
	_showBg: function () {
		this._adjustBgSize();
		this.$bg.fadeIn();
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
	},
	_openInside: function (e) {
		var self = this;
		var url = e.currentTarget.href;
		var opt = this.options;
		this.action.openInsideStart.call(this); // action
		$.ajax(url, {
			cache: opt.cache,
			dataType: 'html',
			success: _.bind(function (res) {
				if (res) {
					var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
					body = body.replace(/<body[^>]*>\n?/, '');
					this.$boxBody.css('visibility', 'hidden').html(body);
				}
				this._adjustBgSize();
				this._initBox(1).done(function () {
					self._showBoxBody();
					self.action.openInsideComplete.call(self); // action
				});
				$(window).scrollTop(this.initialScrollTop);
			}, this)
		});
		e.preventDefault();
	}
});

})(jQuery, _, Backbone, this, this.document);
