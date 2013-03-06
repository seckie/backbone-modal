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
//        animateDuration: 750,
//        animateEasing: 'swing',
//        width: null,
		cache: true,
		boxClassName: 'modal-box',
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
		var id, url;
		_.extend(this.options, options);
		_.extend(this.action, opt.action);
		// element - bg
//        this.$bg = $('.' + opt.bgClassName);
//        if (typeof this.$bg[0] != 'object') {
			this.$bg = new Backbone.View({
				className: opt.bgClassName
			}).$el;
			this.$bg.appendTo(document.body);
//        }
		// element - box
		id = this.$el.data('modal-id');
		url = this.$el.data('modal-url');
		this.$box;

		if (typeof id === 'string') { // id mode
			this.$box = $('#' + id).hide();
			this.$boxBody = this.$box.find('.' + opt.boxBodyClassName);
			this.$dismiss = this.$box.find('.' + opt.dismissClassName);
		} else if (!this.$box && typeof url === 'string') { // url mode
			this.$box = new Backbone.View({
				className: opt.boxClassName
			}).$el;
			this.url = this.$el.data('modal-url'); 
			this.$boxBody = $('<div/>', { 'class': opt.boxBodyClassName }).appendTo(this.$box);
			this.$dismiss = $('<a/>', { 'class': opt.dismissClassName, href: '#', html: '&#215;' }).appendTo(this.$box);
			this.$box.hide().appendTo(document.body);
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
	events: {
		'click.modal': '_open'
	},
	_setupEvents: function () {
		var opt = this.options;
		$(document).on('keydown.modal', this._keyHandler);
		$(document).on('click.modal', '.' + opt.dismissClassName, this._close);
		$(document).on('click.modal', '.' + opt.bgClassName, this._close);
//        $(document).on('click.modal', opt.innerLinkSelector, this._openInside);
	},
	// close modal with Esc key
	_keyHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key === 27) {
			this._close();
		}
	},
	_open: function (e) {
		var opt = this.options;
//        if (opt.width) {
//            this.$box.css({
//                'width': opt.width,
//                'margin-left': Math.floor(opt.width / 2) * -1
//            });
//        } else {
//            this.$box.css({
//                'width': '',
//                'margin-left': ''
//            });
//        }
		if (typeof this.url === 'string') {
			$.ajax(this.url, {
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
		e.preventDefault();
	},
	_close: function (e) {
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
		this.$boxBody.hide();
		this.$box.hide();
		$(window).scrollTop(this.initialScrollTop);
//        if (this.isIE7) {
//            this.$bg.hide();
//            this.closeCallback();
//        } else {
			this.$bg.fadeOut(_.bind(this.action.closeComplete, this)/* action */);
//        }
	},
	_initBox: function () {
		var winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			boxH = this.$box.outerHeight(), 
			scrollTop = $(window).scrollTop(),
			posTop;
		if (winH < scrollTop && bodyH < scrollTop) {
			// prevent too much increase of height
		} else {
			// save scrll position
			this.initialScrollTop = scrollTop;
		}

		if (this.$box.outerHeight() < winH) {
			// small box height
			posTop = this.initialScrollTop + Math.floor((winH - boxH) / 2);
		} else {
			// large box height
			posTop = this.initialScrollTop;
		}
		this.$box.css({
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
//        if (this.isIE7) {
//            this.$bg.show();
//        } else {
			this.$bg.fadeIn();
//        }
	},
	_adjustBgSize: function () {
		this.$bg.width(this._getBgWidth()).height(this._getBgHeight());
	},
	_getBgWidth: function () {
		var winW = $(window).width(),
			bodyW = this.$body.outerWidth(),
			contentW = this.$box.outerWidth();
		return _.max([winW, bodyW, contentW]);
	},
	_getBgHeight: function () {
		var winH = $(window).height(),
			bodyH = this.$body.outerHeight(),
			contentH = this.$box.outerHeight() + $(window).scrollTop();
		return _.max([winH, bodyH, contentH]);
	},
	_openInside: function (e) {//{{{
		var url = e.currentTarget;
		var opt = this.options;
		$.ajax(url, {
			cache: opt.cache,
			success: _.bind(function () {
				this.$box.height(this.$box.height()); // fix height
				this.$boxBody.hide();
				this._adjustBgSize();
				this._initBox();
				$(window).scrollTop(this.initialScrollTop);
				this._showBoxBody();
				// fadeIn effect
//                if (this.isIE7) {
//                    this.inner.show();
//                } else {
					this.$boxBody.fadeIn();
//                }
				this.$box.css('height', ''); // reset height
			}, this)
		});
		e.preventDefault();
	},//}}}

	// interface functions that should be overridden
	action: {
		initComplete: function () { },
		renderComplete: function () { },
		openComplete: function () {},
		closeComplete: function () {}
	}
});

})(jQuery, _, Backbone, this, this.document);
