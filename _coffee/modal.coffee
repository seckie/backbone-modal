###
 * $.Modal
 *
 * @author     Naoki Sekiguchi
 * @url        https://github.com/seckie/backbone-modal
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
###
'use strict'

(($, _, Backbone, window, document) ->

  $.Modal = Backbone.View.extend(
    id: null
    tagName: 'div'
    className: 'modal-box'
    options:
      content: null
      boxBody: '<div class="modal-body"/>'
      bg: '<div class="modal-bg"/>'
      dismiss:  '<a href="#" class="dismiss">&#215;</a>'
      body: 'body'
      cache: true
      fadeDuration: 750
      resumeScrollPosition: true
      transition: true
      action: { }
    initialize: (options) ->
      ###
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
      ###
      opt = @options
      _.extend(@options, options)
      # interface functions that should be overridden
      @action =
        initComplete: ->
        renderComplete: ->
        openStart: ->
        openComplete: ->
        closeStart: ->
        closeComplete: ->
      _.extend(@action, opt.action)
      # elements
      @$body = $(opt.body)
      # element - bg
      if opt.bg?
        @$bg = $(opt.bg).appendTo(@$body)
      # element - box
      @$content = $(opt.content)
      @$boxBody = $(opt.boxBody)
      @$dismiss = $(opt.dismiss)
      @$boxBody.append(@$content)
      @$el.append(@$boxBody)
        .append(@$dismiss)
        .hide()
        .appendTo(@$body)
      @$content.show()

      _.bindAll(this, 'render', '_setupEvents', '_keyHandler', 'open', 'openURL', 'close', 'showBox', 'showBg', 'hideBg', '_adjustBgSize')
      @_setupEvents()
      @action.initComplete.call(this)
      @render(options)
      null

    render: (options) ->
      @action.renderComplete.call(this)
      null

    _setupEvents: ->
      opt = @options
      if @$bg?
        @$bg.on('click.' + @cid, @close)
      @$dismiss.on('click.'+ @cid, @close)
      null

    # close modal with Esc key
    _keyHandler: (e) ->
      key = e.keyCode or e.charCode
      if key is 27
        @close(e)
      null

    open: (url) ->
      # public function
      self = this
      opt = @options
      startCallback = @action.openStart.call(this)
      main = ->
        $(document).on('keydown.' + @cid, @_keyHandler) # add key event
        @showBox(opt.transition).done(_.bind(self.action.openComplete, self))
        @showBg()
        null

      if startCallback? and (typeof startCallback.promise is 'function')
        startCallback.done(_.bind(main, this))
      else
        main.call(this)
      null

    openURL: (url) ->
      self = this
      opt = @options
      startCallback = @action.openStart.call(this)
      main = ->
        $(document).on('keydown.' + self.cid, self._keyHandler) # add key event
        $.ajax(url,
          cache: opt.cache
          dataType: 'html'
          success: (res) ->
            body = res.slice(res.search(/<body/), res.search(/<\/body>/))
            body = body.replace(/<body[^>]*>\n?/, '')
            self.$boxBody.html(body)
            self.showBox(opt.transition).done(_.bind(self.action.openComplete, self))
            self.showBg()
            null
        )
        null

      return if typeof url isnt 'string'

      if startCallback? and (typeof startCallback.promise is 'function')
        startCallback.done(_.bind(main, this))
      else
        main.call(this)
      null

    close: (e) -> # public function
      opt = @options
      startCallback = @action.closeStart.call(this)
      main = ->
        $(document).off('keydown.' + @cid) # remove key event
        @$boxBody.css(
          'visibility': 'hidden'
        )
        @$el.hide()
        if opt.resumeScrollPosition?
          $(window).scrollTop(@initialScrollTop)
        @hideBg().done(_.bind(@action.closeComplete, this))

      if startCallback? and (typeof startCallback.promise is 'function')
        startCallback.done(_.bind(main, this))
      else
        main.call(this)

      e.preventDefault() if e?
      null

    showBox: (transition) ->
      self = this
      winH = $(window).height()
      bodyH = @$body.outerHeight()
      boxH = @$el.outerHeight()
      scrollTop = $(window).scrollTop()
      dfd = $.Deferred()
      show = ->
        self.$boxBody.css('visibility': 'visible')

      if winH < scrollTop and bodyH < scrollTop
        # prevent too much increase of height
      else
        # save scroll position
        @initialScrollTop = scrollTop

      if @$el.outerHeight() < winH
        # small box height
        posTop = @initialScrollTop + Math.floor((winH - boxH) / 2)
      else
        # large box height
        posTop = @initialScrollTop

      if transition == true
        @$el.show().animate(
          'top': posTop,->
            show()
            dfd.resolve()
            null
        )
      else
        @$el.css(
          'top': posTop
        ).show()
        show()
        dfd.resolve()

      dfd.promise()

    showBg: ->
      dfd = $.Deferred()
      if !@$bg?
        dfd.resolve()
        return dfd.promise() # skip

      @_adjustBgSize()

      if @options.fadeDuration > 0
        @$bg.fadeIn(@options.fadeDuration, dfd.revolve)
      else
        @$bg.show()
        dfd.resolve()

      dfd.promise()

    hideBg: ->
      dfd = $.Deferred()
      if !@$bg?
        dfd.resolve()
        return dfd.promise(); # skip

      if @options.fadeDuration > 0
        @$bg.fadeOut(@options.fadeDuration, dfd.resolve)
      else
        @$bg.hide()
        dfd.resolve()

      dfd.promise()

    _adjustBgSize: ->
      winW = $(window).width()
      winH = $(window).height()
      bodyW = @$body.outerWidth()
      bodyH = @$body.outerHeight()
      contentW = @$el.outerWidth()
      contentH = @$el.outerHeight() + $(window).scrollTop()
      bgW = _.max([winW, bodyW, contentW])
      bgH = _.max([winH, bodyH, contentH])

      @$bg.width(bgW).height(bgH)
      null
  )

  null
)(jQuery, _, Backbone, this, this.document)
