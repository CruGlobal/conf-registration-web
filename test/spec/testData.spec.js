import 'angular-mocks';

angular.module('confRegistrationWebApp')
    .service('testData', function() {
        this.conference = {
            'id': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
            'name': 'Big Event 2015',
            'description': '',
            'registrationPages': [{
                'id': '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
                'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
                'title': 'School Questions',
                'position': 0,
                'blocks': [{
                    'id': 'e088fefc-eb9c-4904-b849-017facc9e063',
                    'pageId': '5c69bfcc-9e35-4bd8-8358-fe50fd86052d',
                    'title': 'Email',
                    'exportFieldTitle': null,
                    'type': 'emailQuestion',
                    'required': true,
                    'position': 0,
                    'content': null,
                    'profileType': 'EMAIL',
                    'registrantTypes': [],
                    'rules': []
                }]
            }, {
                'id': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
                'title': 'Page 2',
                'position': 1,
                'blocks': [{
                    'id': '26c09fa0-f62e-4dc4-a568-b061da6fdb09',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Email',
                    'exportFieldTitle': null,
                    'type': 'emailQuestion',
                    'required': false,
                    'position': 0,
                    'content': '',
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': []
                }, {
                    'id': '122a15bf-0608-4813-834a-0d31a8c44c64',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Name',
                    'exportFieldTitle': null,
                    'type': 'nameQuestion',
                    'required': true,
                    'position': 1,
                    'content': null,
                    'profileType': 'NAME',
                    'registrantTypes': [],
                    'rules': []
                }, {
                    'id': '0556295a-3c4d-45b2-a00e-42b1fe199421',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Number',
                    'exportFieldTitle': null,
                    'type': 'numberQuestion',
                    'required': false,
                    'position': 2,
                    'content': '',
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': []
                }, {
                    'id': '2764e22b-8623-4c2b-81e5-f625574521f2',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Dropdown Question',
                    'exportFieldTitle': null,
                    'type': 'selectQuestion',
                    'required': false,
                    'position': 3,
                    'content': {'choices': [{'value': '1', 'desc': ''}]},
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': [{
                        'id': 'e211fa0b-2b23-41e1-afc4-a9a645d97f59',
                        'blockId': '2764e22b-8623-4c2b-81e5-f625574521f2',
                        'parentBlockId': '0556295a-3c4d-45b2-a00e-42b1fe199421',
                        'operator': '>',
                        'value': '12',
                        'position': 0
                    }]
                }, {
                    'id': '0b876382-5fd1-46af-b778-10fc9b1b530d',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Multiple Choice Question',
                    'exportFieldTitle': null,
                    'type': 'radioQuestion',
                    'required': false,
                    'position': 4,
                    'content': {'choices': [{'value': '12', 'desc': ''}, {'value': '23', 'desc': ''}]},
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': [{
                        'id': 'd21552ae-cba4-432d-92ae-6abb3eec7725',
                        'blockId': '0b876382-5fd1-46af-b778-10fc9b1b530d',
                        'parentBlockId': '0556295a-3c4d-45b2-a00e-42b1fe199421',
                        'operator': '>',
                        'value': '100',
                        'position': 0,
                        'ruleType': 'SHOW_OPTION',
                        'blockEntityOption': '23'
                    }]
                }, {
                    'id': '18ccfb09-3006-4981-ab5e-405ccf2aad1c',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Checkbox Question',
                    'exportFieldTitle': null,
                    'type': 'checkboxQuestion',
                    'required': false,
                    'position': 5,
                    'content': {'choices': [{'value': '651', 'desc': ''}, {'value': '951', 'desc': ''}]},
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': [{
                        'id': '326287c7-5a1d-4e79-adc8-67833db055cf',
                        'blockId': '0b876382-5fd1-46af-b778-10fc9b1b530d',
                        'parentBlockId': '0556295a-3c4d-45b2-a00e-42b1fe199421',
                        'operator': '<',
                        'value': '100',
                        'position': 0,
                        'ruleType': 'SHOW_OPTION',
                        'blockEntityOption': '651'
                    }]
                }, {
                    'id': '9b83eebd-b064-4edf-92d0-7982a330272a',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'title': 'Gender',
                    'exportFieldTitle': null,
                    'type': 'genderQuestion',
                    'required': false,
                    'position': 6,
                    'content': '',
                    'profileType': null,
                    'registrantTypes': [],
                    'rules': []
                },{
                  'adminOnly': false,
                  'content': {default: '', ruleoperand: 'AND', forceSelections: {}, forceSelectionRuleOperand: 'AND'},
                  'default': '',
                  'forceSelectionRuleOperand': 'AND',
                  'forceSelections': {},
                  'ruleoperand': 'AND',
                  'endDateBlockId': null,
                  'expenseType': null,
                  'exportFieldTitle': null,
                  'id': '6a525ff7-8999-4e45-9fbe-da33a73128c8',
                  'pageId': '95899b98-4258-41f1-b9fb-8f55fd7cbb50',
                  'position': 7,
                  'profileType': 'ADDRESS',
                  'registrantTypes': [],
                  'required': false,
                  'rules': [],
                  'startDateBlockId': null,
                  'title': 'Address',
                  'type': 'addressQuestion'
                },{
                  'id': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                  'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                  'title': 'Checkbox Parent',
                  'exportFieldTitle': null,
                  'type': 'checkboxQuestion',
                  'required': false,
                  'position': 7,
                  'content': {'choices': [
                      {'value': 'A', 'desc': ''},
                      {'value': 'B', 'desc': ''},
                      {'value': 'C', 'desc': ''},
                      {'value': 'D', 'desc': ''}

                      ]},
                  'profileType': null,
                  'registrantTypes': [],
                  'rules': []
                }, {
                  'id': '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb',
                  'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                  'title': 'Checkbox Rules',
                  'exportFieldTitle': null,
                  'type': 'checkboxQuestion',
                  'required': false,
                  'position': 8,
                  'content': {'choices': [
                      {'value': 'AAA', 'desc': '', 'operand': 'AND'},
                      {'value': 'BBB', 'desc': '', 'operand': 'OR'},
                      {'value': 'CCC', 'desc': ''},
                      {'value': 'DDD', 'desc': ''}
                    ]},
                  'profileType': null,
                  'registrantTypes': [],
                  'rules': [{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05511',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'A',
                    'position': 0,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'AAA'
                  },{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05522',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'B',
                    'position': 1,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'AAA'
                  },{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05522',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'C',
                    'position': 2,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'BBB'
                  },{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05522',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'D',
                    'position': 3,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'BBB'
                  },{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05522',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'A',
                    'position': 4,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'DDD'
                  },{
                    'id': '326287c7-5a1d-4e79-adc8-67833db05522',
                    'blockId': '0b876382-5fd1-46af-b778-bbbbbbbbbbbb',
                    'parentBlockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                    'operator': '=',
                    'value': 'C',
                    'position': 5,
                    'ruleType': 'SHOW_OPTION',
                    'blockEntityOption': 'DDD'
                  }]
                },
                  {
                    'adminOnly': 'false',
                    'content': {
                      'default': {},
                      'ruleoperand': 'AND',
                      'forceSelections': {},
                      'forceSelectionRuleOperand': 'AND'
                    },
                    'choices': [
                      {'value': 'A', 'desc': '', 'operand': 'OR'},
                      {'value': 'B', 'desc': '', 'operand': 'OR'},
                      {'value': 'C', 'desc': '', 'operand': 'OR'}
                    ],
                    'id': '1f8b4b56-22ac-417b-ada1-d2096b782ddd',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'position': '2',
                    'registrantTypes': [],
                    'required': 'false',
                    'rules': [],
                    'title': 'Parent',
                    'type': 'checkboxQuestion'
                  }, {
                    'adminOnly': 'false',
                    'content': {
                      'choices': [
                        {'value': '1', 'desc': '', 'operand': 'OR', 'amount': '50'},
                        {'value': '2', 'desc': '', 'operand': 'OR', 'amount': '20'},
                        {'value': '3', 'desc': '', 'operand': 'OR', 'amount': '10'},
                        {'value': '4', 'desc': '', 'operand': 'OR', 'amount': '90'}
                      ],
                      'default': {'1': 'true', '2': 'true', '3': 'true', '4': 'true'},
                      'forceSelectionRuleOperand': 'AND',
                      'forceSelections': {'1': true, '2': true, '3': true},
                      'ruleoperand': 'AND'
                    },
                    'endDateBlockId': 'null',
                    'expenseType': 'MISCELLANEOUS_ITEM',
                    'exportFieldTitle': 'null',
                    'id': 'bd6cb777-563f-4975-a0c5-58030ee6c36c',
                    'pageId': '7b4c19df-7377-4d37-90fb-5b262bb66d1a',
                    'position': '3',
                    'profileType': 'null',
                    'registrantTypes': [],
                    'required': 'false',
                    'rules': [
                      {
                        'blockEntityOption': '',
                        'blockId': 'bd6cb777-563f-4975-a0c5-58030ee6c36c',
                        'id': '223c9577-1df0-4d1c-be64-7be07c64805d',
                        'operator': '=',
                        'parentBlockId': '1f8b4b56-22ac-417b-ada1-d2096b782ddd',
                        'position': '0',
                        'ruleType': 'SHOW_QUESTION',
                        'value': 'A'
                      },
                      {
                        'blockEntityOption': '2',
                        'blockId': 'bd6cb777-563f-4975-a0c5-58030ee6c36c',
                        'id': '689a25b5-4c7b-40fd-b091-949b8c7fef40',
                        'operator': '=',
                        'parentBlockId': '1f8b4b56-22ac-417b-ada1-d2096b782ddd',
                        'position': 1,
                        'ruleType': 'SHOW_OPTION',
                        'value': 'B'
                      }, {
                        'blockEntityOption': '3',
                        'blockId': 'bd6cb777-563f-4975-a0c5-58030ee6c36c',
                        'id': '97923d22-75df-4a10-83f0-4d4398d766a4',
                        'operator': '=',
                        'parentBlockId': '1f8b4b56-22ac-417b-ada1-d2096b782ddd',
                        'position': 2,
                        'ruleType': 'SHOW_OPTION',
                        'value': 'C'
                      }
                    ],
                    'title': 'Child',
                    'type': 'checkboxQuestion'
                  }
                ]
            }],
            'registrantTypes': [{
                'id': '67c70823-35bd-9262-416f-150e35a03514',
                'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
                'name': 'Child',
                'hidden': false,
                'createdTimestamp': '2015-07-08T18:42:56.628Z',
                'lastUpdatedTimestamp': '2015-07-08T18:42:56.628Z',
                'cost': 12.75,
                'minimumDeposit': null,
                'earlyRegistrationCutoff': '2015-08-06 00:00:00',
                'earlyRegistrationDiscount': false,
                'earlyRegistrationAmount': 10,
                'position': 0,
                'customConfirmationEmailText': '',
                'groupSubRegistrantType': false,
                'description': 'Must be shorter than 3ft',
                'allowGroupRegistrations': true,
                'numberSlotsLimit': 500,
                'useLimit': true,
                'availableSlots': 499,
                'acceptCreditCards': true,
                'acceptTransfers': false,
                'acceptScholarships': true,
                'acceptChecks': false
            }, {
                'id': '47de2c40-19dc-45b3-9663-5c005bd6464b',
                'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
                'name': 'Staff',
                'hidden': false,
                'createdTimestamp': '2015-07-08T18:42:56.629Z',
                'lastUpdatedTimestamp': '2015-07-08T18:42:56.629Z',
                'cost': 50,
                'minimumDeposit': null,
                'earlyRegistrationCutoff': '2014-12-31 14:56:00',
                'earlyRegistrationDiscount': true,
                'earlyRegistrationAmount': 2,
                'position': 1,
                'customConfirmationEmailText': '24',
                'groupSubRegistrantType': false,
                'description': 'Any Campus',
                'allowGroupRegistrations': true,
                'numberSlotsLimit': 10,
                'useLimit': false,
                'availableSlots': 0,
                'acceptCreditCards': false,
                'acceptTransfers': true,
                'acceptScholarships': false,
                'acceptChecks': true
            }, {
                'id': '2b7ca963-0503-47c4-b9cf-6348d59542c3',
                'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
                'name': 'Student',
                'hidden': false,
                'createdTimestamp': '2015-07-08T18:42:56.630Z',
                'lastUpdatedTimestamp': '2015-07-08T18:42:56.631Z',
                'cost': 50,
                'minimumDeposit': null,
                'earlyRegistrationCutoff': '2014-12-09 17:02:11',
                'earlyRegistrationDiscount': false,
                'earlyRegistrationAmount': null,
                'position': 2,
                'customConfirmationEmailText': '<div style=\'text-align: center;\'></div>',
                'groupSubRegistrantType': false,
                'description': 'Whitewater\nMadison\nGreen Bay',
                'allowGroupRegistrations': true,
                'numberSlotsLimit': 10,
                'useLimit': false,
                'availableSlots': 0,
                'acceptCreditCards': true,
                'acceptTransfers': false,
                'acceptScholarships': false,
                'acceptChecks': false
            }],
            'eventStartTime': '2015-12-30 16:48:00',
            'eventEndTime': '2016-06-23 13:43:00',
            'registrationStartTime': '2014-06-23 13:43:07',
            'registrationEndTime': '2016-01-26 14:49:00',
            'eventTimezone': 'America/Chicago',
            'registrationOpen': true,
            'contactPersonName': 'Test Admin',
            'contactPersonEmail': 'xx@cru.org',
            'contactPersonPhone': '4075415138',
            'locationName': 'Pine Summit Camp, Big Bear',
            'locationAddress': '100',
            'locationCity': 'Orlando',
            'locationState': 'FL',
            'locationZipCode': '32832',
            'requireLogin': true,
            'archived': false,
            'earlyRegistrationOpen': false,
            'paymentGatewayType': 'TSYS',
            'paymentGatewayId': '9H59j8uV7sdgsdg343434',
            'paymentGatewayKey': null,
            'paymentGatewayKeySaved': true,
            'registrationCount': 1150,
            'completedRegistrationCount': 1109,
            'customPaymentEmailText': null,
            'rideshareEnabled': false,
            'rideshareEmailContent': null,
            'allowEditRegistrationAfterComplete': true,
            'checkPayableTo': 'Test Admin',
            'checkMailingAddress': '100 Lake Hart Dr.',
            'checkMailingCity': 'Orlando',
            'checkMailingState': 'FL',
            'checkMailingZip': '32832',
            'businessUnit': '23r',
            'operatingUnit': 'v',
            'department': '2',
            'projectId': '435',
            'accountNumber': null,
            'glAccount': null,
            'cruEvent': true
        };

        this.registration = {
            'id': '709738ff-da79-4eed-aacd-d9f005fc7f4e',
            'userId': '0c3a1826-9a81-444f-9299-1f6f5288a0cc',
            'conferenceId': 'c63b8abf-52ff-4cc4-afbc-5923b01f1ab0',
            'calculatedTotalDue': 50.00,
            'calculatedDiscounts': 0.00,
            'calculatedMinimumDeposit': 50.00,
            'calculatedAdditionalExpenses': 0.00,
            'completed': true,
            'completedTimestamp': '2015-02-27T16:39:32.632Z',
            'createdTimestamp': '2015-02-27T16:39:32.581Z',
            'lastUpdatedTimestamp': '2015-05-15T15:23:49.846Z',
            'pastPayments': [
                {
                    'id': '183c3f62-ce26-46c3-b3e6-65768cc3db65',
                    'registrationId': '709738ff-da79-4eed-aacd-d9f005fc7f4e',
                    'amount': 1.00,
                    'transactionDatetime': '2015-05-21T13:13:55.401Z',
                    'paymentType': 'CHECK',
                    'refundedPaymentId': null,
                    'description': null,
                    'creditCard': null,
                    'offlineCreditCard': null,
                    'transfer': null,
                    'scholarship': null,
                    'check': {
                        'checkNumber': '234',
                        'checkType': null
                    }
                }
            ],
            'registrants': [
                {
                    'id': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                    'registrationId': '709738ff-da79-4eed-aacd-d9f005fc7f4e',
                    'userId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                    'registrantTypeId': '2b7ca963-0503-47c4-b9cf-6348d59542c3',
                    'calculatedTotalDue': 50.00,
                    'calculatedMinimumDeposit': 50.00,
                    'calculatedDiscounts': 0.00,
                    'createdTimestamp': '2015-02-27T16:39:32.595Z',
                    'lastUpdatedTimestamp': '2015-07-10T15:06:05.383Z',
                    'withdrawn': false,
                    'withdrawnTimestamp': null,
                    'checkedInTimestamp': '2015-05-15T15:23:57.826Z',
                    'answers': [
                        {
                            'id': '543a972b-537b-4bbf-854c-9ae768d86cf8',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '9b83eebd-b064-4edf-92d0-7982a330272a',
                            'value': 'M',
                            'amount': 0.00
                        },
                        {
                            'id': '3a1cfe9d-e256-44e4-81fe-d4bea03d8e1c',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '0556295a-3c4d-45b2-a00e-42b1fe199421',
                            'value': 235246,
                            'amount': 0.00
                        },
                        {
                            'id': 'd1c692b3-c1c4-4d18-8490-548e81a5a806',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '0b876382-5fd1-46af-b778-10fc9b1b530d',
                            'value': '12',
                            'amount': 0.00
                        },
                        {
                            'id': '60eef5c3-7e09-4b25-a03f-d330fb79ce7f',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '2764e22b-8623-4c2b-81e5-f625574521f2',
                            'value': '1',
                            'amount': 0.00
                        },
                        {
                            'id': '6e52f066-f894-43ac-b9c0-d195bb65443f',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '18ccfb09-3006-4981-ab5e-405ccf2aad1c',
                            'value': {
                                '651': true
                            },
                            'amount': 0.00
                        },
                        {
                            'id': '8c6be491-f956-4fd3-95ad-9b381b106278',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': 'e088fefc-eb9c-4904-b849-017facc9e063',
                            'value': 'test.person@cru.org',
                            'amount': 0.00
                        },
                        {
                            'id': 'c2cdfc82-5898-461c-ad15-438b49be7ca0',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '122a15bf-0608-4813-834a-0d31a8c44c64',
                            'value': {
                                'firstName': 'Test',
                                'lastName': 'Person'
                            },
                            'amount': 0.00
                        },
                        {
                            'id': '84666425-e587-40d5-afb6-d0824eda2f66',
                            'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                            'blockId': '26c09fa0-f62e-4dc4-a568-b061da6fdb09',
                            'value': '',
                            'amount': 0.00
                        },
                        {
                        'amount': 0,
                        'blockId': '6a525ff7-8999-4e45-9fbe-da33a73128c8',
                        'id': '8413f038-0826-4aa6-aba4-2a3615d4a598',
                        'registrantId': '707444b6-c3d6-4b26-8e0a-4e0a437b11b9',
                        'value': {
                          address1: 'Broadway 1',
                          address2: '', 
                          city: 'NYC',
                          state: 'NY',
                          zip: '11111'
                        }
                      },
                      {
                        'id': '84666425-e587-40d5-afb6-cccccccccccc',
                        'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                        'blockId': '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa',
                        'value': '',
                        'amount': 0.00
                      },
                      {
                        'id': '6e52f066-f894-43ac-b9c0-aaaaaaffafaf',
                        'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                        'blockId': '1f8b4b56-22ac-417b-ada1-d2096b782ddd',
                        'value': {
                          'A': true,
                          'B': true,
                          'C': true
                        },
                        'amount': 0.00
                      },
                      {
                        'id': '6e52f066-f894-43ac-b9c0-bfbfbfbfbfbf',
                        'registrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                        'blockId': 'bd6cb777-563f-4975-a0c5-58030ee6c36c',
                        'value': {
                        },
                        'amount': 0.00
                      }
                    ],
                    'firstName': 'Test',
                    'lastName': 'Person',
                    'email': 'test.person@cru.org'
                }
            ],
            'expenses': [],
            'totalPaid': 1.00,
            'remainingBalance': 49.00,
            'primaryRegistrantId': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
            'groupRegistrants': [
                {
                    'id': '6bd0f946-b010-4ef5-83f0-51c17449baf3',
                    'registrationId': '709738ff-da79-4eed-aacd-d9f005fc7f4e',
                    'firstName': 'Test',
                    'lastName': 'Person',
                    'email': 'test.person@cru.org'
                }
            ]
        };
    });
