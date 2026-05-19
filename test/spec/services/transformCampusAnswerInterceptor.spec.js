import 'angular-mocks';

describe('Service: transformCampusAnswerInterceptor', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var transformCampusAnswerInterceptor;
  beforeEach(inject(function (_transformCampusAnswerInterceptor_) {
    transformCampusAnswerInterceptor = _transformCampusAnswerInterceptor_;
  }));

  it('transforms a single campus answer body on PUT', function () {
    var config = {
      method: 'PUT',
      data: {
        id: 'answer-1',
        blockId: 'block-1',
        value: { id: 'campus-1', name: 'Harvard' },
      },
    };

    transformCampusAnswerInterceptor.request(config);

    expect(config.data.value).toBe('campus-1');
  });

  it('transforms campus answers nested in registrants and groupRegistrants', function () {
    var config = {
      method: 'PUT',
      data: {
        registrants: [
          {
            answers: [
              {
                blockId: 'campus-block',
                value: { id: 'campus-1', name: 'Harvard' },
              },
            ],
          },
        ],
        groupRegistrants: [
          {
            answers: [
              {
                blockId: 'campus-block',
                value: { id: 'campus-2', name: 'Yale' },
              },
            ],
          },
        ],
      },
    };

    transformCampusAnswerInterceptor.request(config);

    expect(config.data.registrants[0].answers[0].value).toBe('campus-1');
    expect(config.data.groupRegistrants[0].answers[0].value).toBe('campus-2');
  });

  it('leaves non-campus answer shapes untouched', function () {
    var config = {
      method: 'PUT',
      data: {
        answers: [
          { blockId: 'email-block', value: 'user@example.com' },
          {
            blockId: 'name-block',
            value: { firstName: 'Test', lastName: 'User' },
          },
        ],
      },
    };

    transformCampusAnswerInterceptor.request(config);

    expect(config.data.answers[0].value).toBe('user@example.com');
    expect(config.data.answers[1].value).toEqual({
      firstName: 'Test',
      lastName: 'User',
    });
  });

  it('does not transform on GET requests', function () {
    var config = {
      method: 'GET',
      data: {
        blockId: 'campus-block',
        value: { id: 'campus-1', name: 'Harvard' },
      },
    };

    transformCampusAnswerInterceptor.request(config);

    expect(config.data.value).toEqual({ id: 'campus-1', name: 'Harvard' });
  });
});
