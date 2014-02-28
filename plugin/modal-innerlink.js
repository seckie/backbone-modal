/**
 * $.ModalInnerLink extends $.Modal
 *
 * @author     Naoki Sekiguchi
 * @url        https://github.com/seckie/backbone-modal
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
 */

(function($, _, Backbone, window, document) {

if (typeof $.Modal != 'function') {
	return;
}

$.ModalInnerLink = $.Modal.extend({
	render: function (opt) {
		var defaultOptions = {
				innerLinkEl: null
			},
			defaultAction = {
				openInsideStart: function () {},
				openInsideComplete: function () {}
			};
		_.extend(this.options, defaultOptions, opt); 
		_.extend(this.action, defaultAction, opt.action);
		_.bindAll(this, '_openInside');

		// event bind
		if (typeof this.options.innerLinkEl === 'string') {
			$(document).on('click.' + this.cid, this.options.innerLinkEl, this._openInside);
		}
		this.action.renderComplete.call(this); // action
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
				if (this.$bg) {
					this._adjustBgSize();
				}
				this.showBox(1).done(function () {
					self._showBoxBody();
					self.action.openInsideComplete.call(self); // action
				});
				if (opt.resumeScrollPosition) {
					$(window).scrollTop(this.initialScrollTop);
				}
			}, this)
		});
		if (e) {
			e.preventDefault();
		}
	}
});

})(jQuery, _, Backbone, this, this.document);
