'use strict';

describe('Controller: FormDropAreaCtrl', function () {

  // load the controller's module
  beforeEach(module('confRegistrationWebApp'));

  var FormDropAreaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();

    scope.conference = {
      registrationPages: [
        {
          id: 'page1',
          blocks: [ { id: 'block1' } ]
        },
        {
          id: 'page2',
          blocks: [ { id: 'block2' } ]
        }
      ]
    };

    FormDropAreaCtrl = $controller('FormDropAreaCtrl', {
      $scope: scope
    });
  }));

  it('should have a function to move a block', function () {
    scope.moveBlock('block2', 'page1', 0);

    expect(scope.conference.registrationPages[0].blocks.length).toBe(2);
    expect(scope.conference.registrationPages[0].blocks[0].id).toBe('block2');
  });
});
