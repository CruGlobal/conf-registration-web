import 'angular-mocks';

describe('Service: validationInterceptor', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let $http, $httpBackend;
  beforeEach(inject((_$http_, _$httpBackend_) => {
    $http = _$http_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should add error message after validation error', () => {
    $httpBackend.expectPOST(/action/).respond(500, {
      parameterViolations: [
        {
          message: 'Failed validation',
        },
      ],
    });

    const response = $http.post('action');

    let rejected;
    response.catch((err) => {
      rejected = err.data;
    });

    $httpBackend.flush();

    expect(rejected.error).toEqual({
      message: 'Failed validation',
    });
  });

  it('should not overwrite existing error', () => {
    $httpBackend.expectPOST(/action/).respond(500, {
      parameterViolations: [
        {
          message: 'Failed validation',
        },
      ],
      error: {
        message: 'Error message',
      },
    });

    const response = $http.post('action');

    let rejected;
    response.catch((err) => {
      rejected = err.data;
    });

    $httpBackend.flush();

    expect(rejected.error).toEqual({
      message: 'Error message',
    });
  });
});
