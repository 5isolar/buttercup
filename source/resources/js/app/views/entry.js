'use strict';

// Import Deps
import _ from 'underscore';
import Backbone from 'backbone';
import Tpl from 'tpl/entry.html!text';

// Export View
export default Backbone.View.extend({
    className: 'pane entry-view',

    events: {
        'keyup input': 'setFieldsOnChange',
        'click .btn-save': 'saveEntry',
        'click .btn-cancel': 'cancelChanges',
        'click .btn-remove': 'removeEntry',
        'keypress h1': 'manageTitleChange'
    },

    initialize: function () {
        this.template = _.template(Tpl);
        if (this.model) {
            this.model.on('change', this.showHideActionBar, this);
            this.model.on('destroy', function () {
                console.log("model destroyed");
            });
        }
    },

    render: function () {
        this.$el.html(this.template(
            this.model ? this.model.toJSON() : {
                blank: true
            }
        ));
        return this;
    },

    setFieldsOnChange: function (e) {
        $(e.currentTarget).attr('data-changed', true);
        this.showHideActionBar(true);
    },

    showHideActionBar: function (showHideFlag) {
        this.$('.view-footer .left').toggle(!!showHideFlag);
    },

    manageTitleChange: function (e) {
        this.showHideActionBar(true);
        if (e.which === 13) {
            e.preventDefault();
            return false;
        }
    },

    saveEntry: function () {
        var changed  = {
            meta: {}
        };

        // Title field
        changed.title = this.$('h1').text().trim();

        // Normal fields
        this.$('input[name][data-changed]').each(function (index, field) {
            changed[field.getAttribute('name')] = field.value;
        });

        // Custom Fields
        this.$('input[data-custom-field-title]').each(function (index, field) {
            var $field = $(field),
                $next  = $field.next('input[data-custom-field-value'),
                key    = $field.val(),
                value  = $next.val();
            if (key.length > 0 && value.length > 0) {
                changed.meta[$field.val()] = $next.val();
            }
        });

        this.$('[data-custom-field][data-changed]').each(function (index, field) {
            changed.meta[field.getAttribute('data-custom-field')] = field.value;
        });

        // Set new attributes
        this.model.set(changed);

        this.model.save({}, {
            wait: true,
            success: () => {
                this.showHideActionBar(false);
            }
        });
    },

    cancelChanges: function () {
        this.render();
    },

    destroy: function () {
        this.$el.remove();
    },

    removeEntry: function () {
        this.model.destroy({
            wait: true,
            success: () => {
                this.destroy()
            }
        });
    }
});