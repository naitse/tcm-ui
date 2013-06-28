define(function (require) {

	var barman = require('barman'),
		Class = barman.Class,

		extend = require('jquery').extend,

		testCasesModel = require('tcmModel').releases.iterations.features.test_cases,

		TemplateBasedView = require('views/templateBasedView');


	var TestCaseView = TemplateBasedView.extend({
		
		template: require('text!templates/testCase/testCase.hbs'),
		templateData: function () { return extend({}, this.testCase, this.options); },

		viewStates: {
			normal:'',
			notloading:  function () { this.unblock(); },
			loading: function () { 
				console.log('jkajksa')
				this.block({
				message:'<div class="loading-small-block"></div>',
				overlayCSS:  { 
					backgroundColor: '#000', 
					opacity:         0.2, 
					cursor:          'wait' 
				},
				fadeIn:0,
				fadeOut:0
			}) }

		},


		initializeOptions: function (testCase, options) {
			this.testCase = testCase;
			console.log(options.delBtn)
			this.options = {
				btnGroup: (options.btnGroup || options.btnGroup === false ) ? options.btnGroup : true,
				delBtn: (options.delBtn || options.delBtn === false ) ? options.delBtn : true,
				editBtn: (options.editBtn || options.editBtn === false ) ? options.editBtn : true,
				bugBtn: (options.bugBtn || options.bugBtn === false ) ? options.bugBtn : true,
				stausDd: (options.stausDd || options.stausDd === false ) ? options.stausDd : true
			}
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
				eval('this.viewStates.'+state+'.bind(this)');
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

				self.container.html(self.views.map(function (testCaseView) { return (testCaseView.element().children().data('tcObject',testCaseView.testCase)); }));

			});

		},

		refreshTestCase: function (testCase) {
			this.views.forEach(function (testCaseView) { testCaseView.refreshIfContains(testCase); });
		},

		toggleState: function(testCaseId, state) {
			this.views.forEach(function (testCaseView) { testCaseView.updateState(testCaseId, state); });	
		}

	});

});