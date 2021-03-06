define(function (require) {

	var barman = require('barman'),
		Class = barman.Class,

		extend = require('jquery').extend,

		testCasesModel = require('tcmModel').releases.iterations.features.test_cases,

		PM = require('panelsManager'),

		TemplateBasedView = require('views/templateBasedView');


	var TestCaseView = TemplateBasedView.extend({
		
		template: require('text!templates/testCase/testCase.hbs'),
		templateData: function () { return extend({}, this.testCase, this.options); },

		viewStates: {
			normal:'',
			notloading:  function () { element.unblock(); },
			loading: function (element) { 
				console.log('jkajksa', element)
				element.block({
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

			this.options = {
				btnGroup: (options.btnGroup || options.btnGroup === false ) ? options.btnGroup : true,
				delBtn: (options.delBtn || options.delBtn === false ) ? options.delBtn : true,
				editBtn: (options.editBtn || options.editBtn === false ) ? options.editBtn : true,
				bugBtn: (options.bugBtn || options.bugBtn === false ) ? options.bugBtn : true,
				stausDd: (options.stausDd || options.stausDd === false ) ? options.stausDd : true,
				hideActualResult:(testCase.actualResult === null || testCase.actualResult === "" ) ? true : false
			}

			this.testCase = testCase;

		},

		events: {
			'click .tc': function () {
				console.log('clicked', this);
			},
			'click .edit-tc': function(e){
           		e.stopPropagation();
	            PM.colapseExpandRightPanel('#tcViewer','none');
	            $('#tcViewer .tc .wrapper').removeClass('active');
	            $(this).parents('.wrapper').addClass('active');
	            editTc($(this).parents('.tc').data('tcObject'))
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
				console.log(testCaseId)
				this.viewStates.loading(this.testCase)
			}

		}

	});

	return Class.create({ //TestCasesView <-------

		constructor: function (container, options) {
			this.container = container;
			this.options = options;
			this.views = [];

		},

		renderTestCases: function (featureId) {
			var self = this;

			testCasesModel.fetch(0, 0, featureId).done(function (testCases) {

				self.views = testCases.map(function (testCase) { return new TestCaseView(testCase, self.options); });

				self.container.html(self.views.map(function (testCaseView) { 

					parent_node = testCaseView.element()
					node = parent_node.children();
					node.data('tcObject',testCaseView.testCase)

					return (parent_node); }));

			});

		},

		refreshTestCase: function (testCase) {
			this.views.forEach(function (testCaseView) { testCaseView.refreshIfContains(testCase); });
		},

		toggleState: function(testCaseId, state) {
			console.log(testCaseId)
			this.views.forEach(function (testCaseView) { testCaseView.updateState(testCaseId, state); });	
		}

	});

});