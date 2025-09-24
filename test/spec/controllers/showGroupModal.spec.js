import 'angular-mocks';

describe('Component: showGroupModal', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let controller;

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    $templateCache.put('views/components/showGroupModal.html', '<div></div>');

    const mockResolve = {
      groupName: 'Test Group',
      registrationId: 'test-registration-id',
      conference: { registrantTypes: [] },
      getRegistration: jasmine.createSpy('getRegistration').and.returnValue({
        groupRegistrants: [
          { id: 'primary-id', registrantTypeId: 'primary-type-id' },
        ],
        primaryRegistrantId: 'primary-id',
      }),
      getRegistrantType: jasmine
        .createSpy('getRegistrantType')
        .and.returnValue({
          id: 'primary-type-id',
          allowedRegistrantTypeSet: [
            {
              childRegistrantTypeId: 'child-type-id',
              numberOfChildRegistrants: 2,
            },
          ],
        }),
      editRegistrant: jasmine.createSpy('editRegistrant'),
      deleteRegistrant: jasmine.createSpy('deleteRegistrant'),
      registerUser: jasmine.createSpy('registerUser'),
    };

    const scope = $rootScope.$new();
    scope.resolve = mockResolve;
    scope.dismiss = jasmine.createSpy('dismiss');

    const element = $compile(
      '<show-group-modal resolve="resolve" dismiss="dismiss"></show-group-modal>',
    )(scope);
    scope.$digest();
    controller = element.isolateScope().$ctrl;
  }));

  describe('registrationTypeFull edge cases', function () {
    it('should return false when allowedRegistrantTypeSet is empty array', function () {
      controller.getRegistrantType.and.returnValue({
        id: 'primary-type-id',
        allowedRegistrantTypeSet: [],
      });

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when allowedRegistrantTypeSet is undefined', function () {
      controller.getRegistrantType.and.returnValue({
        id: 'primary-type-id',
        allowedRegistrantTypeSet: undefined,
      });

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when allowedRegistrantTypeSet is null', function () {
      controller.getRegistrantType.and.returnValue({
        id: 'primary-type-id',
        allowedRegistrantTypeSet: undefined,
      });

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when primary registrant type is null', function () {
      controller.getRegistrantType.and.returnValue(null);

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when registration is null', function () {
      controller.getRegistration.and.returnValue(null);

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when groupRegistrants is undefined', function () {
      controller.getRegistration.and.returnValue({
        primaryRegistrantId: 'primary-id',
      });

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return false when primary registrant is not found', function () {
      controller.getRegistration.and.returnValue({
        groupRegistrants: [
          { id: 'other-id', registrantTypeId: 'other-type-id' },
        ],
        primaryRegistrantId: 'non-existent-id',
      });

      expect(controller.registrationTypeFull({ id: 'any-type-id' })).toBe(
        false,
      );
    });

    it('should return true when allowedRegistrantTypeSet length is equal to numberOfChildRegistrants', function () {
      controller.getRegistrantType.and.returnValue({
        id: 'primary-type-id',
        allowedRegistrantTypeSet: [
          {
            childRegistrantTypeId: 'child-type-id',
            numberOfChildRegistrants: 2,
          },
        ],
      });
      controller.getRegistration.and.returnValue({
        groupRegistrants: [
          { id: 'primary-id', registrantTypeId: 'primary-type-id' },
          { id: 'child-id-1', registrantTypeId: 'child-type-id' },
          { id: 'child-id-2', registrantTypeId: 'child-type-id' },
        ],
        primaryRegistrantId: 'primary-id',
      });

      expect(controller.registrationTypeFull({ id: 'child-type-id' })).toBe(
        true,
      );
    });

    it('should return true when allowedRegistrantTypeSet length > numberOfChildRegistrants', function () {
      controller.getRegistrantType.and.returnValue({
        id: 'primary-type-id',
        allowedRegistrantTypeSet: [
          {
            childRegistrantTypeId: 'child-type-id',
            numberOfChildRegistrants: 2,
          },
        ],
      });
      controller.getRegistration.and.returnValue({
        groupRegistrants: [
          { id: 'primary-id', registrantTypeId: 'primary-type-id' },
          { id: 'child-id-1', registrantTypeId: 'child-type-id' },
          { id: 'child-id-2', registrantTypeId: 'child-type-id' },
          { id: 'child-id-3', registrantTypeId: 'child-type-id' },
        ],
        primaryRegistrantId: 'primary-id',
      });

      expect(controller.registrationTypeFull({ id: 'child-type-id' })).toBe(
        true,
      );
    });
  });
});
