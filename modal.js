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
		innerLinkSelector: null,
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
		$(document).on('keydown.modal', this._keyHandler);
		$(document).on('click.modal', '.' + opt.dismissClassName, this.close);
		$(document).on('click.modal', '.' + opt.bgClassName, this.close);
		if (typeof opt.innerLinkSelector === 'string') {
			$(document).on('click.modal', opt.innerLinkSelector, this._openInside);
		}
	},
	// close modal with Esc key
	_keyHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key === 27) {
			this.close();
		}
	},
	open: function () { // public function
		var opt = this.options;
		if (typeof opt.url === 'string') {
			$.ajax(opt.url, {
				cache: opt.cache,
				dataType: 'html',
				success: _.bind(fire, this)
			});
		} else {
			fire.call(this);
		}

		function fire (res) {
			if (res) {
				var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
				body = body.replace(/<body[^>]*>\n?/, '');
				this.$boxBody.html(body);
			}
			this._initBox();
			this._showBg();
			this._showBoxBody();
			this.action.openComplete.call(this); // action
		}
	},
	close: function () { // public function
		var opt = this.options;
		this.$boxBody.hide();
		this.$el.hide();
		$(window).scrollTop(this.initialScrollTop);
		this.$bg.fadeOut(_.bind(this.action.closeComplete, this)/* action */);
	},
	_initBox: function () {
		var winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			boxH = this.$el.outerHeight(), 
			scrollTop = $(window).scrollTop(),
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
		this.$el.css({
			'top': posTop
		}).show();
		this.$boxBody.hide();
//        this.$boxBody.css({
//            'visibility': 'hidden'
//        });
	},
	_showBoxBody: function () {
		this.$boxBody.fadeIn();
//        this.$boxBody.css({
//            'visibility': 'visible'
//        });
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
		var url = e.currentTarget.href;
		var opt = this.options;
		$.ajax(url, {
			cache: opt.cache,
			dataType: 'html',
			success: _.bind(function (res) {
				this.$el.height(this.$el.height()); // fix height
				if (res) {
					var body = res.slice(res.search(/<body/), res.search(/<\/body>/));
					body = body.replace(/<body[^>]*>\n?/, '');
					this.$boxBody.hide().html(body);
				}
				this._adjustBgSize();
				this._initBox();
				$(window).scrollTop(this.initialScrollTop);
				this._showBoxBody();
//                this.$boxBody.fadeIn();
				this.$el.css('height', ''); // reset height
			}, this)
		});
		e.preventDefault();
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
