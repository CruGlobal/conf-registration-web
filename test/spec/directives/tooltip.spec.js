import 'angular-mocks';

describe('tooltip directive', function () {
  let $compile, $scope;

  beforeEach(function () {
    angular.mock.module('confRegistrationWebApp');

    inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    });
  });

  const compile = function (html) {
    const element = $compile(html)($scope);
    $scope.$digest();

    return element;
  };

  it('renders with transcluded content', function () {
    const element = compile(
      '<tooltip content="Test tooltip"><i class="fa fa-info"></i></tooltip>',
    );

    expect(element.find('.tooltip-wrapper').length).toBe(1);
    expect(element.find('i.fa-info').length).toBe(1);
  });

  it('sets accessibility attributes on trigger element', function () {
    const element = compile(
      '<tooltip content="Test tooltip"><i class="fa fa-info"></i></tooltip>',
    );
    const trigger =
      element[0].querySelector('.tooltip-wrapper').firstElementChild;

    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(trigger.getAttribute('role')).toBe('img');
    expect(trigger.getAttribute('aria-label')).toBe('More information');
  });

  it('sets aria-labelledby when provided', function () {
    const element = compile(
      '<tooltip content="Test tooltip" aria-labelledby="test-label"><i class="fa fa-info"></i></tooltip>',
    );
    const trigger =
      element[0].querySelector('.tooltip-wrapper').firstElementChild;

    expect(trigger.getAttribute('aria-labelledby')).toBe('test-label');
    expect(trigger.getAttribute('aria-label')).toBe(null);
  });

  it('creates and stores tippy instance', function () {
    const element = compile(
      '<tooltip content="Test tooltip"><i class="fa fa-info"></i></tooltip>',
    );

    expect(element.data('tippyInstance')).toBeDefined();
  });

  it('destroys tippy instance on scope destroy', function () {
    const element = compile(
      '<tooltip content="Test tooltip"><i class="fa fa-info"></i></tooltip>',
    );
    const tippyInstance = element.data('tippyInstance');

    spyOn(tippyInstance, 'destroy');
    element.isolateScope().$destroy();

    expect(tippyInstance.destroy).toHaveBeenCalledWith();
  });
});
