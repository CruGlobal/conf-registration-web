import 'angular-mocks';

const mockMinistries = [
  {
    id: 'acfbef45-57a4-4a9b-a527-a3d57e98b66b',
    name: 'Military',
    activities: [],
    strategies: [],
    eventTypes: [],
  },
  {
    id: 'f6d8e4c6-60c1-4c59-9495-d6c3eb65cac1',
    name: 'Lifelines',
    strategies: [],
    activities: [
      {
        id: 'e7aab792-4bce-4032-85b4-35f73d8db46b',
        name: 'Rock Climbing',
      },
      {
        id: '8a577943-2acb-4c6f-8a86-a3c442332610',
        name: 'General',
      },
      {
        id: 'd4970a28-e63d-4e51-b8d7-c337d5662cb3',
        name: 'Canoeing/Kayaking',
      },
    ],
    eventTypes: [],
  },
  {
    id: 'f6d31fe3-7078-4fac-a37b-9596d57558e9',
    name: 'Campus - National Team/Strategy',
    strategies: [
      {
        id: '15d3a7ae-93c9-40ff-97f4-9f31f7036f21',
        name: 'Destino',
      },
      {
        id: '9769eb02-1075-45fc-ae03-c7733627a1ef',
        name: 'N/A',
      },
      {
        id: 'd7d42d11-59b0-4d1f-9906-3ab706c63e8a',
        name: 'Bridges',
      },
      {
        id: '7eeae1c0-205a-4435-9557-a721a81604d3',
        name: 'Epic',
      },
    ],
    activities: [],
    eventTypes: [
      {
        id: 'cfc2b308-566b-432b-bee4-4ed60fec5608',
        name: 'Fall Retreat/Getaway',
      },
      {
        id: '272907e5-7c2b-4ba5-97b8-1ed7e07c290b',
        name: 'N/A',
      },
      {
        id: '0f87dff6-0115-4d86-8bc7-5e785334b3e2',
        name: 'Spring Break',
      },
    ],
  },
  {
    id: '87b02878-5070-473b-bb07-3b2d899b46d6',
    name: 'Athletes in Action',
    strategies: [],
    activities: [
      {
        id: '22532e40-f458-4ae6-b045-24815e104013',
        name: 'SCRC Events',
      },
      {
        id: '31073156-9599-4a51-9b61-2bb6dbbf447b',
        name: 'Domestic Projects',
      },
    ],
    eventTypes: [],
  },
];

describe('Service: MinistriesCache', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let MinistriesCache, $httpBackend, $rootScope;
  beforeEach(inject((_MinistriesCache_, _$httpBackend_, _$rootScope_) => {
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    MinistriesCache = _MinistriesCache_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('get', () => {
    it('should fetch and sort data', () => {
      $httpBackend.expectGET(/ministries/).respond(200, mockMinistries);

      let ministries;
      MinistriesCache.get().then((result) => {
        ministries = result;
      }, fail);

      $httpBackend.flush();
      $rootScope.$apply();

      expect(ministries.map(({ name }) => name)).toEqual([
        'Athletes in Action',
        'Campus - National Team/Strategy',
        'Lifelines',
        'Military',
      ]);

      expect(ministries[2].activities.map(({ name }) => name)).toEqual([
        'Canoeing/Kayaking',
        'General',
        'Rock Climbing',
      ]);

      expect(ministries[1].strategies.map(({ name }) => name)).toEqual([
        'Bridges',
        'Destino',
        'Epic',
        'N/A',
      ]);

      expect(ministries[1].eventTypes.map(({ name }) => name)).toEqual([
        'Fall Retreat/Getaway',
        'Spring Break',
        'N/A',
      ]);
    });

    it('should use cached data on subsequent calls', () => {
      $httpBackend.expectGET(/ministries/).respond(200, mockMinistries);

      MinistriesCache.get().catch(fail);
      $httpBackend.flush();
      MinistriesCache.get().catch(fail);

      // afterEach asserts that there are no outstanding HTTP requests
    });

    it('should handle HTTP errors', () => {
      $httpBackend.expectGET(/ministries/).respond(500, 'Server Error');

      let errorCaught = false;
      MinistriesCache.get().then(fail, () => {
        errorCaught = true;
      });

      $httpBackend.flush();

      expect(errorCaught).toBe(true);
    });
  });
});
