import 'angular-mocks';

describe('Directive: promotion', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let element, scope;
  beforeEach(inject(function ($compile, $rootScope, $templateCache, testData) {
    $templateCache.put('views/components/promotion.html', '');

    scope = $rootScope.$new();
    scope.promo = testData.conference.promotions[0];
    scope.conference = testData.conference;
    scope.onDelete = jasmine.createSpy('onDelete');

    element = $compile(
      '<promotion promo="promo" conference="conference" on-delete="onDelete()" />',
    )(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  it('toggleExpanded should toggle expanded', function () {
    expect(scope.expanded).toBe(false);

    scope.toggleExpanded();

    expect(scope.expanded).toBe(true);

    scope.toggleExpanded();

    expect(scope.expanded).toBe(false);
  });

  it('toggleRegistrantType should toggle registrant type id', function () {
    expect(scope.promo.registrantTypeIds.length).toBe(2);

    const removedId = scope.promo.registrantTypeIds[0];
    scope.toggleRegistrantType(removedId);

    expect(scope.promo.registrantTypeIds).not.toContain(removedId);
    expect(scope.promo.registrantTypeIds.length).toBe(1);

    const addedId = scope.conference.registrantTypes[2].id;
    scope.toggleRegistrantType(addedId);

    expect(scope.promo.registrantTypeIds).toContain(addedId);
    expect(scope.promo.registrantTypeIds.length).toBe(2);
  });
});
