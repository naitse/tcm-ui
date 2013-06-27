define(function (require) {

	var barman = require('barman'),
		Class = barman.Class,

		extend = require('jquery').extend,

		testCasesModel = require('tcmModel').releases.iterations.features.test_cases,

		TemplateBasedView = require('views/templateBasedView');


	var TestCaseView = TemplateBasedView.extend({
		
		template: require('text!templates/testCase.hbs'),
		templateData: function () { return extend({}, this.testCase, this.options); },

		initializeOptions: function (testCase, options) {
			this.testCase = testCase;
			this.options = options;


			var viewStates = {
				normal:'',
				notloading:  function () { this.unblock(); },
				loading: function () { this.block({
					message:'<div class="loading-small-block"></div>',
					overlayCSS:  { 
						backgroundColor: '#000', 
						opacity:         0.2, 
						cursor:          'wait' 
					},
					fadeIn:0,
					fadeOut:0
				}) }

			}
			
			this.viewState = viewStates['normal'];
		},

		events: {
			'click .one': function () {
				console.log('BUTTON 1');
				console.log(this.testCase);
			},
			
			'click .two': function () {
				console.log('BUTTON 2');
				console.log(this.testCase);
			}
		},

		refreshIfContains: function (testCase) {
			if (this.testCase.tcId === testCase.tcId) {
				this.testCase = extend(this.testCase, testCase);
				this.refresh();
			}
		},

		updateState: function (testCaseId, state) {

			if (this.testCase.tcId === testCaseId) {
				this.viewState.state.call(this);
			}

		}

	});

	return Class.create({

		constructor: function (container, options) {
			this.container = container;
			this.options = options;
			this.views = [];

		},

		renderTestCases: function (featureId) {
			var self = this;

			testCasesModel.fetch(0, 0, featureId).done(function (testCases) {

				self.views = testCases.map(function (testCase) { return new TestCaseView(testCase, self.options); });

				self.container.html(self.views.map(function (view) { return view.element(); }));

			});

		},

		refreshTestCase: function (testCase) {
			this.views.forEach(function (view) { view.refreshIfContains(testCase); });
		},

		toggleState: function(testCaseId, state) {
			this.views.forEach(function (view) { view.updateState(testCase, state); });	
		}

	});

});