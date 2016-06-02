(function($) {

    var createOnClick = function(e) {
        var i = e.data.i;
        var self = e.data.self;

        e.preventDefault();
        // set tab as current tab
        self.currentTab = i;
        // switch tab to specified by index
        self.switchTo(i); 
    };

    var createOnKeydown = function(e) {
        var i = e.data.i;
        var self = e.data.self;

        // strike spacebar triggers the tab to expand
        if ( e.keyCode == 32 ) {
            e.preventDefault();
            // set tab as current tab
            self.currentTab = i;
            // switch to the last tab of the set
            self.switchTo(i);
        }
    };

    var tabSet = function(el){
        this.el = el;
        this.tabs = {};
        this.currentTab;
        this.active = false;

        var self = this;
        var $tabControls = $(this.el).find('[data-control]');

        var tabObj = function(el) {
            var tab = this;
            this.control = el.getAttribute('data-control');

            this.$el = $(el);
            this.$tabpanel = $('#'+this.control);
        }

        tabObj.prototype.createPanel = function() {
            // add aria attributes
            this.$el.attr('aria-controls', this.control);
            this.$tabpanel.parent().attr({'aria-live': 'polite', 'aria-relevant': 'removals additions'});
        }

        tabObj.prototype.removePanel = function() {
            // remove aria attributes and any 'active' classes or display properties that have been applied
            this.$el.removeAttr('aria-controls').removeClass('active');
            this.$tabpanel.parent().removeAttr('aria-live aria-relevant');
            this.$tabpanel.removeAttr('aria-hidden tabindex').css('display', '');
        }

        // change aria attribute values to indicate that the tab contents are hidden
        tabObj.prototype.hidePanel = function() {
            // remove 'expanded' and 'active' states on tab
            this.$el.attr('aria-expanded', false).removeClass('active');
            // hide tabpanel and remove it from tab order
            this.$tabpanel.attr({'aria-hidden': true, 'tabindex': -1}).hide();
        }

        // change aria attribute values to indicate that the tab contents are showing
        tabObj.prototype.showPanel = function(focus = true) {
            var tab = this;
            // set tab as 'expanded' and 'active'
            this.$el.attr('aria-expanded', true).addClass('active');
            // set tabpanel as visible, and set to be focusable by adding to tab order (which was probably set to -1)
            this.$tabpanel.attr({'aria-hidden': false, 'tabindex': 0}).show();
            // set focus on tabpanel heading element
            //this.$tabpanel_header.focus();
        }

        // create tabs in this set
        this.tabs = $tabControls.map(function(i, el) {
            // init a new object created from anchor element
            var tab = new tabObj(el);

            // return tab object into an array for storage
            return tab;
        }).toArray();

        this.build();

    };

    tabSet.prototype.build = function() {
        var self = this;

        this.active = true;
        // add a class to component to mark it as activated
        $(this.el).addClass(this.el.substr(1)+'__activated');

        // loop through all tabObjs stored in tabs array
        for (i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            // setup the tab and its panel as an "accessible tabs" component
            tab.createPanel();

            // create listeners for the tab's link
            tab.$el.on('click', {i: i, self: self}, createOnClick).on('keydown', {i: i, self: self}, createOnKeydown);
        }

        if (!this.currentTab) {
            // set all tabs as closed for the initial state
            this.closeAll();
        } else {
            // set last recorded open tab as the open tab, and do not set focus on tab
            this.switchTo(this.currentTab, false);
        }

        // return tabSet object for chaining
        return this;
    }

    tabSet.prototype.destroy = function() {

        this.active = false;
        // remove class on component that marks it as activated
        $(this.el).removeClass(this.el.substr(1)+'__activated');

        // loop through all tabObjs stored in tabs array
        for (i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            // remove anything that makes this an aria component
            tab.removePanel();

            // remove all event listeners that were added
            tab.$el.off('click', createOnClick).off('click', createOnKeydown);
        }

        // return tabSet object for chaining
        return this;
    }

    tabSet.prototype.closeAll = function(n, focus) {
        if (this.active) {
            // hide all tab panels
            for (i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                if (i != n) {
                    tab.hidePanel();
                }
            }
        }
    }

    tabSet.prototype.switchTo = function(n, focus) {
        if (this.active) {
            // hide all tab panels
            this.closeAll();
            // show specified panel
            // passes optional boolean `focus` which defines whether or not focus is set on tab
            this.tabs[n].showPanel(focus);
        }
    }

    var constructTabSet = function(el) {
        if (document.querySelector(el) !== null) {
            return new tabSet(el);
        }
    }

    // expose tabSet object to global scope for use
    window.tabSet = constructTabSet;

})(window.jQuery);