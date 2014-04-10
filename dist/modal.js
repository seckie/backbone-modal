
/*
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
      boxBody: '<div class="modal-body"/>',
      bg: '<div class="modal-bg"/>',
      dismiss: '<a href="#" class="dismiss">&#215;</a>',
      body: 'body',
      cache: true,
      fadeDuration: 750,
      resumeScrollPosition: true,
      action: {}
    },
    initialize: function(options) {

      /*
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
      var opt;
      opt = this.options;
      _.extend(this.options, options);
      this.action = {
        initComplete: function() {},
        renderComplete: function() {},
        openStart: function() {},
        openComplete: function() {},
        closeStart: function() {},
        closeComplete: function() {}
      };
      _.extend(this.action, opt.action);
      this.$body = $(opt.body);
      if (opt.bg != null) {
        this.$bg = $(opt.bg).appendTo(this.$body);
      }
      this.$content = $(opt.content);
      this.$boxBody = $(opt.boxBody);
      this.$dismiss = $(opt.dismiss);
      this.$boxBody.append(this.$content);
      this.$el.append(this.$boxBody).append(this.$dismiss).hide().appendTo(this.$body);
      this.$content.show();
      _.bindAll(this, 'render', '_setupEvents', '_keyHandler', 'open', 'openURL', 'close', 'showBox', 'showBg', 'hideBg', '_adjustBgSize');
      this._setupEvents();
      this.action.initComplete.call(this);
      this.render(options);
      return null;
    },
    render: function(options) {
      this.action.renderComplete.call(this);
      return null;
    },
    _setupEvents: function() {
      var opt;
      opt = this.options;
      if (this.$bg != null) {
        this.$bg.on('click.' + this.cid, this.close);
      }
      this.$dismiss.on('click.' + this.cid, this.close);
      return null;
    },
    _keyHandler: function(e) {
      var key;
      key = e.keyCode || e.charCode;
      if (key === 27) {
        this.close(e);
      }
      return null;
    },
    open: function(url) {
      var main, opt, self, startCallback;
      self = this;
      opt = this.options;
      startCallback = this.action.openStart.call(this);
      main = function() {
        $(document).on('keydown.' + this.cid, this._keyHandler);
        this.showBox().done(_.bind(self.action.openComplete, self));
        this.showBg();
        return null;
      };
      if ((startCallback != null) && (typeof startCallback.promise === 'function')) {
        startCallback.done(_.bind(main, this));
      } else {
        main.call(this);
      }
      return null;
    },
    openURL: function(url) {
      var main, opt, self, startCallback;
      self = this;
      opt = this.options;
      startCallback = this.action.openStart.call(this);
      main = function() {
        $(document).on('keydown.' + self.cid, self._keyHandler);
        $.ajax(url, {
          cache: opt.cache,
          dataType: 'html',
          success: function(res) {
            var body;
            body = res.slice(res.search(/<body/), res.search(/<\/body>/));
            body = body.replace(/<body[^>]*>\n?/, '');
            self.$boxBody.html(body);
            self.showBox().done(_.bind(self.action.openComplete, self));
            self.showBg();
            return null;
          }
        });
        return null;
      };
      if (typeof url !== 'string') {
        return;
      }
      if ((startCallback != null) && (typeof startCallback.promise === 'function')) {
        startCallback.done(_.bind(main, this));
      } else {
        main.call(this);
      }
      return null;
    },
    close: function(e) {
      var main, opt, startCallback;
      opt = this.options;
      startCallback = this.action.closeStart.call(this);
      main = function() {
        $(document).off('keydown.' + this.cid);
        this.$boxBody.css({
          'visibility': 'hidden'
        });
        this.$el.hide();
        if (opt.resumeScrollPosition != null) {
          $(window).scrollTop(this.initialScrollTop);
        }
        return this.hideBg().done(_.bind(this.action.closeComplete, this));
      };
      if ((startCallback != null) && (typeof startCallback.promise === 'function')) {
        startCallback.done(_.bind(main, this));
      } else {
        main.call(this);
      }
      if (e != null) {
        e.preventDefault();
      }
      return null;
    },
    showBox: function(transition) {
      var bodyH, boxH, dfd, posTop, scrollTop, self, show, winH;
      self = this;
      winH = $(window).height();
      bodyH = this.$body.outerHeight();
      boxH = this.$el.outerHeight();
      scrollTop = $(window).scrollTop();
      dfd = $.Deferred();
      show = function() {
        return self.$boxBody.css({
          'visibility': 'visible'
        });
      };
      if (winH < scrollTop && bodyH < scrollTop) {

      } else {
        this.initialScrollTop = scrollTop;
      }
      if (this.$el.outerHeight() < winH) {
        posTop = this.initialScrollTop + Math.floor((winH - boxH) / 2);
      } else {
        posTop = this.initialScrollTop;
      }
      if (transition != null) {
        this.$el.show().animate({
          'top': posTop
        }, function() {
          show();
          dfd.resolve();
          return null;
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
    showBg: function() {
      var dfd;
      dfd = $.Deferred();
      if (this.$bg == null) {
        dfd.resolve();
        return dfd.promise();
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
    hideBg: function() {
      var dfd;
      dfd = $.Deferred();
      if (this.$bg == null) {
        dfd.resolve();
        return dfd.promise();
      }
      if (this.options.fadeDuration > 0) {
        this.$bg.fadeOut(this.options.fadeDuration, dfd.resolve);
      } else {
        this.$bg.hide();
        dfd.resolve();
      }
      return dfd.promise();
    },
    _adjustBgSize: function() {
      var bgH, bgW, bodyH, bodyW, contentH, contentW, winH, winW;
      winW = $(window).width();
      winH = $(window).height();
      bodyW = this.$body.outerWidth();
      bodyH = this.$body.outerHeight();
      contentW = this.$el.outerWidth();
      contentH = this.$el.outerHeight() + $(window).scrollTop();
      bgW = _.max([winW, bodyW, contentW]);
      bgH = _.max([winH, bodyH, contentH]);
      this.$bg.width(bgW).height(bgH);
      return null;
    }
  });
  return null;
})(jQuery, _, Backbone, this, this.document);
