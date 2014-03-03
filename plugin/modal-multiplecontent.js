/**
 * $.ModalMultipleContent extends $.Modal
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

$.ModalMultipleContent = $.Modal.extend({
	/**
	 * Usage: 
	 *
	 * var MyCollection = Backbone.Collection.extend({
	 *   url: './'
	 * });
	 * var myCollection = new MyCollection();
	 * var urls = [
	 *   'modal5.html',
	 *   'modal6.html',
	 *   'modal7.html'
	 * ];
	 * _.each(urls, function (url, i) {
	 *   var myModel = new Backbone.Model({ id: url });
	 *   collection.add(myModel);
	 * });
	 * var modal1 = new $.ModalMultipleContent({
	 *   collection: myCollection
	 * });
	 */
		
	render: function (options) {
		var defaultOptions = {
				collection: null, // required
				index: 0,
				prev: '<a href="#" class="prev">&larr;</a>',
				next: '<a href="#" class="next">&rarr;</a>'
			},
			defaultAction = {
				pagingStart: function () {},
				pagingComplete: function () {}
			},
			opt = this.options;
		_.extend(this.options, defaultOptions, options); 
		_.extend(this.action, defaultAction, options.action);
		_.bindAll(this, 'prev', 'next', 'update', 'fetch', 'successHandler');

		// property
		this.index = opt.index;
		this.collection = opt.collection;
		// elements
		this.$prev = $(opt.prev).appendTo(this.$el);
		this.$next = $(opt.next).appendTo(this.$el);
		// event bind
		this.$prev.on('click', this.prev);
		this.$next.on('click', this.next);

		// initialize
		this.update();

		// callback
		this.action.renderComplete.call(this);
	},
	prev: function (e) {
		console.log('previous.');
		this.index --;
		this.update();
		if (e) {
			e.preventDefault();
		}
	},
	next: function (e) {
		console.log('next.');
		this.index ++;
		this.update();
		if (e) {
			e.preventDefault();
		}
	},
	update: function (index) {
		if (typeof index === 'number') {
			this.index = index;
		}
		if (this.index <= 0) {
			this.index = 0; // force index
			this.$prev.hide();
		} else {
			this.$prev.show();
		}
		if (this.index >= this.collection.length -1) {
			this.index = this.collection.length -1; // force index
			this.$next.hide();
		} else {
			this.$next.show();
		}
		this.fetch();
	},
	fetch: function () {
		this.collection.at(this.index).fetch({
			dataType: 'html',
			success: this.successHandler,
			error: this.errorHandler 
		});
	},
	successHandler: function (model, res, options) {
		var body;
		if (res) {
			body = res.slice(res.search(/<body/), res.search(/<\/body>/));
			body = body.replace(/<body[^>]*>\n?/, '');
			this.$boxBody.css('visibility', 'hidden').html(body);
		}
		this.showBox(1).done(_.bind(this.action.pagingComplete, this));
		if (this.options.resumeScrollPosition) {
			$(window).scrollTop(this.initialScrollTop);
		}
	},
	errorHandler: function (model, response, options) {
		
	}
});

})(jQuery, _, Backbone, this, this.document);
