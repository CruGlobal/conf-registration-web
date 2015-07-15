'use strict';

console.log('**********************USING MOCK BACKEND**********************');

angular.module('confRegistrationWebApp')
  .run(function ($httpBackend, uuid) {

    $httpBackend.whenGET(/views\/.*/).passThrough();

    var registrations = {
      '012': [
        {
          'user': 'user-1',
          'answers': [
            {
              'blockId': 'block-2',
              'value': {
                firstName: 'Ron',
                lastName: 'Steve'
              }
            },
            {
              'blockId': 'block-4',
              'value': 'Man'
            },
            {
              'blockId': 'block-5',
              'value': 'Yes'
            },
            {
              'blockId': 'block-6',
              'value': 'No'
            },
            {
              'blockId': 'block-7',
              'value': 'Waffles'
            },
            {
              'blockId': 'block-8',
              'value': 'Burger'
            },
            {
              'blockId': 'block-9',
              'value': 'Steak'
            }
          ]
        },
        {
          'user': 'user-2',
          'answers': [
            {
              'blockId': 'block-2',
              'value': 'Jerry'
            },
            {
              'blockId': 'block-3',
              'value': 'Perdue'
            },
            {
              'blockId': 'block-4',
              'value': 'Man'
            },
            {
              'blockId': 'block-5',
              'value': 'Yes'
            },
            {
              'blockId': 'block-6',
              'value': 'Yes'
            },
            {
              'blockId': 'block-7',
              'value': 'Pancakes'
            },
            {
              'blockId': 'block-8',
              'value': 'Sandwich'
            },
            {
              'blockId': 'block-9',
              'value': 'Shrimp'
            }
          ]
        },
        {
          'user': 'user-3',
          'answers': [
            {
              'blockId': 'block-2',
              'value': 'Tom'
            },
            {
              'blockId': 'block-4',
              'value': 'Man'
            },
            {
              'blockId': 'block-5',
              'value': 'No'
            },
            {
              'blockId': 'block-6',
              'value': 'Yes'
            },
            {
              'blockId': 'block-7',
              'value': 'Omelettes'
            },
            {
              'blockId': 'block-8',
              'value': 'Soup'
            },
            {
              'blockId': 'block-9',
              'value': 'Lobster'
            }
          ]
        }
      ]
    };

      var conferences = [{
        'id': '34e4f769-3b80-44e1-88b5-29053662ed93',
        'name': 'Montana State Cru Fall Raft Trip 2014',
        'description': 'Come Join us for a great day on the water!',
        'registrationPages': [{
          'id': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
          'conferenceId': '34e4f769-3b80-44e1-88b5-29053662ed93',
          'title': 'Your Information',
          'position': 0,
          'blocks': [{
            'id': '74b26da5-36cd-49bf-b2f5-d9e708f83dc9',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Name',
            'exportFieldTitle': null,
            'type': 'nameQuestion',
            'required': true,
            'position': 0,
            'content': null,
            'profileType': 'NAME',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '9fbdbfa4-d38f-4b1d-8396-10c4a346f5df',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Phone Number',
            'exportFieldTitle': null,
            'type': 'numberQuestion',
            'required': true,
            'position': 1,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '8aa2d508-4c5f-498c-ade9-1a1de79f34f9',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Email',
            'exportFieldTitle': null,
            'type': 'emailQuestion',
            'required': true,
            'position': 2,
            'content': null,
            'profileType': 'EMAIL',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '9468d54f-fb8d-4580-bdc4-c7c74846d2b0',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Year in School',
            'exportFieldTitle': null,
            'type': 'yearInSchoolQuestion',
            'required': true,
            'position': 3,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '8ef01221-9052-4278-9dfb-d2913638ecc6',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Gender',
            'exportFieldTitle': null,
            'type': 'genderQuestion',
            'required': true,
            'position': 4,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '84f84c37-fc6d-49e9-95fb-c570ed39cbc0',
            'pageId': '433d978a-87c1-4b9b-9f10-a177d15d27f0',
            'title': 'Do you have a car and would be willing to drive?',
            'exportFieldTitle': null,
            'type': 'selectQuestion',
            'required': true,
            'position': 5,
            'content': {'choices': [{'value': 'Yes', 'desc': ''}, {'value': 'No', 'desc': ''}]},
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }]
        }],
        'registrantTypes': [{
          'id': '5b256026-46b2-fd2b-8577-7cbf191296e7',
          'conferenceId': '34e4f769-3b80-44e1-88b5-29053662ed93',
          'name': 'STANDARD',
          'hidden': false,
          'createdTimestamp': '2015-04-02T13:44:56.041Z',
          'lastUpdatedTimestamp': '2015-04-02T13:44:56.041Z',
          'cost': 20,
          'minimumDeposit': null,
          'earlyRegistrationCutoff': '2014-08-25 20:00:00',
          'earlyRegistrationDiscount': false,
          'earlyRegistrationAmount': 0,
          'position': 0,
          'customConfirmationEmailText': null,
          'groupSubRegistrantType': false,
          'description': null,
          'allowGroupRegistrations': false,
          'numberSlotsLimit': 0,
          'useLimit': false,
          'availableSlots': 0,
          'acceptCreditCards': false,
          'acceptTransfers': false,
          'acceptScholarships': false,
          'acceptChecks': false
        }],
        'eventStartTime': '2014-09-01 09:00:00',
        'eventEndTime': '2015-09-01 16:00:00',
        'registrationStartTime': '2014-08-24 13:30:00',
        'registrationEndTime': '2015-08-31 11:59:00',
        'eventTimezone': 'America/Denver',
        'registrationOpen': true,
        'contactPersonName': 'Adam',
        'contactPersonEmail': 'adam.meyer@cru.org',
        'contactPersonPhone': null,
        'locationName': 'Wild West Whitewater Rafting',
        'locationAddress': '906 Scott Street',
        'locationCity': 'Gardiner',
        'locationState': 'MT',
        'locationZipCode': '59030',
        'requireLogin': false,
        'archived': false,
        'earlyRegistrationOpen': false,
        'paymentGatewayType': 'TRUST_COMMERCE',
        'paymentGatewayId': null,
        'paymentGatewayKey': null,
        'paymentGatewayKeySaved': false,
        'registrationCount': 201,
        'completedRegistrationCount': 118,
        'customPaymentEmailText': null,
        'rideshareEnabled': false,
        'rideshareEmailContent': null,
        'allowEditRegistrationAfterComplete': false,
        'checkPayableTo': null,
        'checkMailingAddress': null,
        'checkMailingCity': null,
        'checkMailingState': null,
        'checkMailingZip': null,
        'businessUnit': null,
        'operatingUnit': null,
        'department': null,
        'projectId': null,
        'accountNumber': null,
        'glAccount': null,
        'cruEvent': false
      }, {
        'id': 'fd1c1808-2bc1-453c-8366-719b2e79c614',
        'name': 'Reg complete error test',
        'description': null,
        'registrationPages': [{
          'id': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
          'conferenceId': 'fd1c1808-2bc1-453c-8366-719b2e79c614',
          'title': 'Your Information',
          'position': 0,
          'blocks': [{
            'id': '71453907-e806-4f68-93bf-7e504f298755',
            'pageId': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
            'title': 'Email',
            'exportFieldTitle': null,
            'type': 'emailQuestion',
            'required': true,
            'position': 0,
            'content': null,
            'profileType': 'EMAIL',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '81e2a7cc-127f-4958-8f56-b00729364c9b',
            'pageId': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
            'title': 'Information',
            'exportFieldTitle': null,
            'type': 'paragraphContent',
            'required': false,
            'position': 1,
            'content': 'Contrary to popular belief, Lorem Ipsum is not simply random text.',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '91403687-dd67-40d2-b08c-63611e5c3e72',
            'pageId': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
            'title': 'Name',
            'exportFieldTitle': null,
            'type': 'nameQuestion',
            'required': true,
            'position': 2,
            'content': null,
            'profileType': 'NAME',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '30446f3b-9842-4004-84ac-86597ea17521',
            'pageId': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
            'title': 'Are you bringing a parent?',
            'exportFieldTitle': null,
            'type': 'radioQuestion',
            'required': false,
            'position': 3,
            'content': {
              'choices': [{'value': 'Yes', 'desc': ''}, {
                'value': 'No',
                'desc': ''
              }, {'value': 'Depends if they are alive', 'desc': ''}]
            },
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': 'c1108a85-a993-409e-a3b8-8bc73627dbed',
            'pageId': '8b9503ad-0fdc-4414-8a8a-c9965adc820c',
            'title': 'Date',
            'exportFieldTitle': null,
            'type': 'dateQuestion',
            'required': false,
            'position': 4,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': [{
              'id': '30e5c1ad-a07a-4705-9190-882c950c258b',
              'blockId': 'c1108a85-a993-409e-a3b8-8bc73627dbed',
              'parentBlockId': '30446f3b-9842-4004-84ac-86597ea17521',
              'operator': '=',
              'value': 'Yes',
              'position': 0
            }]
          }]
        }, {
          'id': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
          'conferenceId': 'fd1c1808-2bc1-453c-8366-719b2e79c614',
          'title': 'Page 2',
          'position': 1,
          'blocks': [{
            'id': 'b1db263e-464a-45fb-9ac8-22df78a1969b',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Question',
            'exportFieldTitle': null,
            'type': 'textQuestion',
            'required': false,
            'position': 0,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '3045456f-ae51-4a8f-8f88-b8630415a657',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Question',
            'exportFieldTitle': null,
            'type': 'textareaQuestion',
            'required': false,
            'position': 1,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '812ea2ab-b6d3-41da-9679-bee027c03b66',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Multiple Choice Question',
            'exportFieldTitle': null,
            'type': 'radioQuestion',
            'required': false,
            'position': 2,
            'content': {
              'choices': [{'value': '1', 'desc': ''}, {'value': '2', 'desc': ''}, {
                'value': 'C',
                'desc': ''
              }, {'value': 'D', 'desc': ''}]
            },
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '26e1e8f3-cd1b-4fa7-87ef-b9b7e208eea7',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Checkbox Question',
            'exportFieldTitle': null,
            'type': 'checkboxQuestion',
            'required': false,
            'position': 3,
            'content': {
              'choices': [{'value': '1', 'desc': ''}, {'value': '2', 'desc': ''}, {
                'value': '3',
                'desc': ''
              }, {'value': '4', 'desc': ''}]
            },
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '64e4b312-6cff-414a-ba46-53eb227692e7',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Dropdown Question',
            'exportFieldTitle': null,
            'type': 'selectQuestion',
            'required': false,
            'position': 4,
            'content': {
              'choices': [{'value': '1', 'desc': '', 'amount': 12}, {'value': '2', 'desc': ''}, {
                'value': '3',
                'desc': '',
                'amount': 2345
              }, {'value': '4', 'desc': ''}, {'value': '5', 'desc': ''}]
            },
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '772ed40f-5822-4c2e-a7c9-2c4a9c3def31',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Number',
            'exportFieldTitle': null,
            'type': 'numberQuestion',
            'required': false,
            'position': 5,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '85fff1d7-1a2d-45b2-9791-f659c068ebdc',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Date',
            'exportFieldTitle': null,
            'type': 'dateQuestion',
            'required': false,
            'position': 6,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '007352f1-2673-4764-b485-ad2509ebefa2',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Name',
            'exportFieldTitle': null,
            'type': 'nameQuestion',
            'required': false,
            'position': 7,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': 'bcce2e00-ef13-427f-abc1-c2f64cee57e3',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Email',
            'exportFieldTitle': null,
            'type': 'emailQuestion',
            'required': false,
            'position': 8,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '591ca2bf-b47c-4263-a34e-beb66065464c',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Telephone',
            'exportFieldTitle': null,
            'type': 'phoneQuestion',
            'required': false,
            'position': 9,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '821bf0e1-4ceb-450e-a931-318137aa49fd',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Address',
            'exportFieldTitle': null,
            'type': 'addressQuestion',
            'required': false,
            'position': 10,
            'content': '',
            'profileType': 'ADDRESS',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': 'efb5bb35-1611-4089-a9a8-c2c99e5b7c31',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Gender',
            'exportFieldTitle': null,
            'type': 'genderQuestion',
            'required': false,
            'position': 11,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '8f5358ed-2fd7-4fa9-9d9c-ea5039ce63b2',
            'pageId': 'd6eb3486-d6fc-4942-bdb5-bce898770aff',
            'title': 'Year in School',
            'exportFieldTitle': null,
            'type': 'yearInSchoolQuestion',
            'required': false,
            'position': 12,
            'content': '',
            'profileType': null,
            'registrantTypes': [],
            'rules': []
          }]
        }],
        'registrantTypes': [{
          'id': 'c78cfbc1-21d3-4a4c-b9d4-2049c6695af0',
          'conferenceId': 'fd1c1808-2bc1-453c-8366-719b2e79c614',
          'name': 'Default',
          'hidden': false,
          'createdTimestamp': '2015-07-01T17:48:07.779Z',
          'lastUpdatedTimestamp': '2015-07-01T17:48:07.779Z',
          'cost': 2500,
          'minimumDeposit': 10,
          'earlyRegistrationCutoff': '2014-09-22 13:40:10',
          'earlyRegistrationDiscount': false,
          'earlyRegistrationAmount': null,
          'position': 0,
          'customConfirmationEmailText': '',
          'groupSubRegistrantType': false,
          'description': 'Contrary to popular belief, Lorem Ipsum is not simply random text.',
          'allowGroupRegistrations': true,
          'numberSlotsLimit': 500,
          'useLimit': false,
          'availableSlots': 0,
          'acceptCreditCards': true,
          'acceptTransfers': false,
          'acceptScholarships': true,
          'acceptChecks': false
        }, {
          'id': 'cc0e0fb5-8fcb-4feb-a7a6-0c6509331565',
          'conferenceId': 'fd1c1808-2bc1-453c-8366-719b2e79c614',
          'name': 'Secondary',
          'hidden': false,
          'createdTimestamp': '2015-07-01T17:48:07.781Z',
          'lastUpdatedTimestamp': '2015-07-01T17:48:07.782Z',
          'cost': 15.63,
          'minimumDeposit': null,
          'earlyRegistrationCutoff': '2015-05-06 16:13:12',
          'earlyRegistrationDiscount': false,
          'earlyRegistrationAmount': null,
          'position': 1,
          'customConfirmationEmailText': '',
          'groupSubRegistrantType': false,
          'description': 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undo.',
          'allowGroupRegistrations': true,
          'numberSlotsLimit': 0,
          'useLimit': false,
          'availableSlots': 0,
          'acceptCreditCards': false,
          'acceptTransfers': true,
          'acceptScholarships': true,
          'acceptChecks': false
        }],
        'eventStartTime': '2015-07-09 12:33:00',
        'eventEndTime': '2019-01-29 13:40:00',
        'registrationStartTime': '2014-09-15 13:40:10',
        'registrationEndTime': '2017-09-29 13:40:00',
        'eventTimezone': 'America/New_York',
        'registrationOpen': true,
        'contactPersonName': 'adam meyer',
        'contactPersonEmail': 'adam.meyer@cru.org',
        'contactPersonPhone': null,
        'locationName': 'Cru',
        'locationAddress': null,
        'locationCity': null,
        'locationState': null,
        'locationZipCode': null,
        'requireLogin': true,
        'archived': false,
        'earlyRegistrationOpen': false,
        'paymentGatewayType': 'AUTHORIZE_NET',
        'paymentGatewayId': '123',
        'paymentGatewayKey': null,
        'paymentGatewayKeySaved': false,
        'registrationCount': 3,
        'completedRegistrationCount': 0,
        'customPaymentEmailText': null,
        'rideshareEnabled': false,
        'rideshareEmailContent': null,
        'allowEditRegistrationAfterComplete': true,
        'checkPayableTo': 'Adam',
        'checkMailingAddress': null,
        'checkMailingCity': null,
        'checkMailingState': null,
        'checkMailingZip': null,
        'businessUnit': null,
        'operatingUnit': null,
        'department': null,
        'projectId': null,
        'accountNumber': null,
        'glAccount': null,
        'cruEvent': false
      }, {
        'id': '4942dea0-4912-498e-a186-4f324768b7c4',
        'name': 'Adams Big Event 2015 (clone)',
        'description': null,
        'registrationPages': [{
          'id': '90600ee1-a1c9-45cb-9d98-9c403298acd4',
          'conferenceId': '4942dea0-4912-498e-a186-4f324768b7c4',
          'title': 'Your Information',
          'position': 0,
          'blocks': [{
            'id': 'cf82b6c2-62d7-44a8-bda1-4ec8d3b42e3c',
            'pageId': '90600ee1-a1c9-45cb-9d98-9c403298acd4',
            'title': 'Name',
            'exportFieldTitle': null,
            'type': 'nameQuestion',
            'required': true,
            'position': 0,
            'content': null,
            'profileType': 'NAME',
            'registrantTypes': [],
            'rules': []
          }, {
            'id': '739e6c52-5c65-450b-8de8-8a2b2f118deb',
            'pageId': '90600ee1-a1c9-45cb-9d98-9c403298acd4',
            'title': 'Email',
            'exportFieldTitle': null,
            'type': 'emailQuestion',
            'required': true,
            'position': 1,
            'content': null,
            'profileType': 'EMAIL',
            'registrantTypes': [],
            'rules': []
          }]
        }],
        'registrantTypes': [{
          'id': 'be57418f-62e8-4897-8982-0bc3275c5f08',
          'conferenceId': '4942dea0-4912-498e-a186-4f324768b7c4',
          'name': 'Default',
          'hidden': false,
          'createdTimestamp': '2015-06-10T18:43:20.046Z',
          'lastUpdatedTimestamp': '2015-06-10T18:43:20.046Z',
          'cost': 0,
          'minimumDeposit': null,
          'earlyRegistrationCutoff': '2015-06-17 14:43:15',
          'earlyRegistrationDiscount': false,
          'earlyRegistrationAmount': null,
          'position': 0,
          'customConfirmationEmailText': null,
          'groupSubRegistrantType': false,
          'description': null,
          'allowGroupRegistrations': false,
          'numberSlotsLimit': 0,
          'useLimit': false,
          'availableSlots': 0,
          'acceptCreditCards': false,
          'acceptTransfers': false,
          'acceptScholarships': false,
          'acceptChecks': false
        }],
        'eventStartTime': '2015-06-24 14:43:15',
        'eventEndTime': '2015-06-30 14:43:15',
        'registrationStartTime': '2015-06-10 14:43:15',
        'registrationEndTime': '2015-06-24 14:43:15',
        'eventTimezone': 'America/New_York',
        'registrationOpen': false,
        'contactPersonName': 'Adam Meyer',
        'contactPersonEmail': 'adam.meyer@cru.org',
        'contactPersonPhone': null,
        'locationName': null,
        'locationAddress': null,
        'locationCity': null,
        'locationState': null,
        'locationZipCode': null,
        'requireLogin': false,
        'archived': true,
        'earlyRegistrationOpen': false,
        'paymentGatewayType': 'AUTHORIZE_NET',
        'paymentGatewayId': null,
        'paymentGatewayKey': null,
        'paymentGatewayKeySaved': false,
        'registrationCount': 0,
        'completedRegistrationCount': 0,
        'customPaymentEmailText': null,
        'rideshareEnabled': false,
        'rideshareEmailContent': null,
        'allowEditRegistrationAfterComplete': true,
        'checkPayableTo': null,
        'checkMailingAddress': null,
        'checkMailingCity': null,
        'checkMailingState': null,
        'checkMailingZip': null,
        'businessUnit': null,
        'operatingUnit': null,
        'department': null,
        'projectId': null,
        'accountNumber': null,
        'glAccount': null,
        'cruEvent': false
      }];

    $httpBackend.whenGET(/^conferences\/?$/).respond(function () {
      console.log(arguments);
      var headers = {};
      return [200, conferences, headers];
    });
    $httpBackend.whenPOST(/^conferences\/?$/).respond(function (verb, url, data) {
      console.log(arguments);

      var conference = angular.extend(angular.fromJson(data), { id: uuid() });

      var headers = {
        'Location': '/conferences/' + conference.id
      };
      return [201, conference, headers];
    });
    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });

      return [200, conference, {}];
    });
    $httpBackend.whenPUT(/^conferences\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url, data) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });

      angular.extend(conference, angular.fromJson(data));

      return [200, conference, {}];
    });

    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/registrations\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      return [200, registrations[conferenceId], {}];
    });
    $httpBackend.whenPOST(/^conferences\/[-a-zA-Z0-9]+\/registrations\/?$/).respond(function (verb, url) {
      console.log(arguments);
      var registrationId = uuid();

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });
      var blocks = [];
      angular.forEach(conference.pages, function (page) {
        angular.forEach(page.blocks, function (block) {
          blocks.push(block);
        });
      });
      var answers = [];
      angular.forEach(blocks, function (block) {
        answers.push({
          id: registrationId,
          block: block.id,
          registration: registrationId,
          value: {}
        });
      });

      var registration = {
        id: registrationId,
        conference: conferenceId,
        answers: answers
      };

      var headers = {
        'Location': '/registrations/' + registration.id
      };

      var registrationJson = angular.toJson(registration);
      sessionStorage.setItem(headers.Location, registrationJson);
      sessionStorage.setItem('/conferences/' + conferenceId + '/registrations/current', registration.id);

      return [201, registration, headers];
    });
    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/registrations\/current\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var registrationId = sessionStorage.getItem('/conferences/' + conferenceId + '/registrations/current');
      if (registrationId) {
        return [200, sessionStorage.getItem('/registrations/' + registrationId)];
      }

      return [404];
    });
    $httpBackend.whenGET(/^registrations\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var registrationId = url.split('/')[1];
      var registration = sessionStorage.getItem('/registrations/' + registrationId);
      if (registration) {
        return [200, registration];
      }

      return [404];
    });

    $httpBackend.whenPUT(/^answers\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url, data) {
      console.log(arguments);
      var answer = angular.fromJson(data);

      if (!answer.registration) {
        return [400, { message: 'registration must be present' }];
      }
      if (!answer.block) {
        return [400, { message: 'block must be present' }];
      }
      if (!answer.value) {
        return [400, { message: 'value must be present' }];
      }
      if (!answer.id) {
        answer.id = uuid();
      }

      var key = '/registrations/' + answer.registration;
      var registration = angular.fromJson(sessionStorage.getItem(key));
      if (registration) {
        var answers = registration.answers;
        var existingAnswerIndex = _.findIndex(answers, { block: answer.block });
        if (existingAnswerIndex !== -1) {
          answers.splice(existingAnswerIndex, 1);
        }
        answers.push(answer);
        sessionStorage.setItem(key, angular.toJson(registration));
      }

      return [200, answer];
    });
  });
