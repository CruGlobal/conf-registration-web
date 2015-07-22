'use strict';

describe('Controller: paymentModal', function () {
  var scope, modalInstance, controller, registration;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    registration = {
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
          'readyToProcess': false,
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
            }
          ],
          'firstName': 'Test',
          'lastName': 'Person',
          'email': 'test.person@cru.org'
        }
      ],
      'expenses': [],
      'totalPaid': 1.00,
      'remainingBalance': 49.00
    };

    scope = $rootScope.$new();
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    controller = $controller('paymentModal', {
      $scope: scope,
      $modalInstance: modalInstance,
      registration: registration,
      conference: {},
      permissions: {}
    });
  }));

  it('canBeRefunded should return true', function () {
    expect(scope.canBeRefunded(registration.pastPayments[0])).toBe(true);
  });
});