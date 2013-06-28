define(function (require) {

	var barman = require('barman'),
		Class = barman.Class,
		required = barman.required,
		Handlebars = require('handlebars');

	return Class.create({

		events: {},
		template: required,
		initializeOptions: function () {},
		templateData: function () { return {}; },
		refresh: function() { this.render(); },

		constructor: function () {
			this.initializeOptions.apply(this, arguments);
			this.$el = this.createElement();
			this.render();
			this.bindEvents();
		},

		createElement: function () {
			return $('<div></div>');
		},

		bindEvents: function () {
			var key, eventInfo;
			
			for (var key in this.events) {
				if (this.events.hasOwnProperty(key)) {

					eventInfo = this.parseEvent(this.events[key], key);
					this.$el.on(eventInfo.event, eventInfo.selector, eventInfo.handler);

				}
			}

		},

		parseEvent: function (value, key) {
			var keyParts = key.split(' '),
				handler = (typeof value === 'function') ? value : this[value];

			return {
				event: keyParts.shift(),
				selector: keyParts.join(' '),
				handler: handler.bind(this)
			};
		},

		compileTemplate: function (src) {
			return Handlebars.compile(src);
		},

		compiledTemplate: function () {
			if (!this._compiledTemplate) {
				this._compiledTemplate = this.compileTemplate(this.template);
			}
			return this._compiledTemplate;
		},

		render: function () {
			var tmpl = this.compiledTemplate();
			this.$el.html(tmpl( this.templateData() ));
		},

		element: function (selector) {
			if (!selector) { return this.$el; }
			return this.$el.find(selector);
		}

	});
});