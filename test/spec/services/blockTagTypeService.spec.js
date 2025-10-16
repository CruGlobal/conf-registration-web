import 'angular-mocks';

describe('Service: BlockTagTypeService', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let blockTagTypeService, $httpBackend, $rootScope;

  beforeEach(inject((_blockTagTypeService_, _$httpBackend_, _$rootScope_) => {
    blockTagTypeService = _blockTagTypeService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  const conferenceId = 'test-conference-123';
  const defaultBlockTagType = {
    id: null,
    ministryId: null,
    name: 'None',
    prettyName: 'None',
  };
  const mockBlockTagTypes = [
    {
      id: '7a09d6f3-0c25-4281-aa60-b7702e713b9c',
      ministryId: null,
      name: 'test_name',
      prettyName: 'First Name',
    },
    {
      id: '3d84hdf9-8285-4d1d-9b1a-e1c6fffa8179',
      ministryId: null,
      name: 'test_name_2',
      prettyName: 'Last Name',
    },
    {
      id: 'a1b2c3d4-5678-90ab-cdef-123456789012',
      ministryId: null,
      name: 'test_name_3',
      prettyName: 'Email',
    },
  ];

  describe('loadBlockTagTypes', () => {
    it('should return default block tag type when no conferenceId provided', (done) => {
      blockTagTypeService
        .loadBlockTagTypes()
        .then((types) => {
          expect(types).toEqual([defaultBlockTagType]);
          done();
        })
        .catch(done.fail);

      $rootScope.$digest();
    });

    it('should fetch block tag types from API for a conference', (done) => {
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      blockTagTypeService
        .loadBlockTagTypes(conferenceId)
        .then((types) => {
          // Should include the default "None" option plus the fetched types
          expect(types.length).toBe(4);
          expect(types[0].name).toBe('None');
          expect(types[1].name).toBe('test_name');
          expect(types[2].name).toBe('test_name_2');
          expect(types[3].name).toBe('test_name_3');
          done();
        })
        .catch(done.fail);

      $httpBackend.flush();
    });

    it('should cache block tag types and not make duplicate API calls', (done) => {
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      // First call - should hit the API
      blockTagTypeService
        .loadBlockTagTypes(conferenceId)
        .then((types) => {
          expect(types.length).toBe(4);

          // Second call - should use cache, no new API call
          blockTagTypeService
            .loadBlockTagTypes(conferenceId)
            .then((cachedTypes) => {
              expect(cachedTypes.length).toBe(4);
              expect(cachedTypes).toEqual(types);
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);

      $httpBackend.flush();
    });

    it('should return default block tag type on API error', (done) => {
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(500, 'Internal Server Error');

      blockTagTypeService
        .loadBlockTagTypes(conferenceId)
        .then((types) => {
          expect(types).toEqual([defaultBlockTagType]);
          done();
        })
        .catch(done.fail);

      $httpBackend.flush();
    });

    it('should fetch new block tag types for a different conference', () => {
      const otherConferenceId = 'other-conference-456';
      const otherMockTypes = [
        {
          id: '3d84hdf98fh-8285-4d1d-9b1a-e1c6fffa8179',
          ministryId: null,
          name: 'test_name_4',
          prettyName: 'Pretty Name 4',
        },
      ];

      // First load conference
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      let firstResult;
      blockTagTypeService.loadBlockTagTypes(conferenceId).then((types) => {
        firstResult = types;
      });

      $httpBackend.flush();

      expect(firstResult.length).toBe(4);

      // Load different conference - should make new API call
      $httpBackend
        .expectGET(`blockTagTypes/${otherConferenceId}`)
        .respond(200, otherMockTypes);

      let secondResult;
      blockTagTypeService
        .loadBlockTagTypes(otherConferenceId)
        .then((otherTypes) => {
          secondResult = otherTypes;
        });

      $httpBackend.flush();

      expect(secondResult.length).toBe(2);
      expect(secondResult[1]).toEqual(otherMockTypes[0]);
    });
  });

  describe('blockTagTypes', () => {
    it('should return only default type before any load', () => {
      blockTagTypeService.clearCache();
      const types = blockTagTypeService.blockTagTypes();

      expect(types).toEqual([defaultBlockTagType]);
    });
  });

  describe('validateFieldSelection', () => {
    beforeEach((done) => {
      // Load some block tag types for validation tests
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      blockTagTypeService.loadBlockTagTypes(conferenceId).then(() => {
        done();
      });

      $httpBackend.flush();
    });

    it('should return valid for "None" selection', () => {
      const blockTagTypeMapping = [];
      const result = blockTagTypeService.validateFieldSelection(
        null,
        blockTagTypeMapping,
        'block-1',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return invalid if block tag type not found', () => {
      const blockTagTypeMapping = [];
      const result = blockTagTypeService.validateFieldSelection(
        'non-existent-block-tag',
        blockTagTypeMapping,
        'block-1',
      );

      expect(result).toEqual({
        valid: false,
        message: 'Invalid block tag type.',
      });
    });

    it('should return valid if block tag type is not yet assigned', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[1].id,
        blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return valid if same block is selecting the same block tag type', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'Question 1',
          blockTagTypeId: mockBlockTagTypes[0].id,
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        'block-1',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return invalid if block tag type is already assigned to another block', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({
        valid: false,
        message: 'First Name has already been selected on First Name Question.',
      });
    });

    it('should handle multiple blocks with different block tag types', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
        },
        {
          blockId: 'block-2',
          title: 'Last Name Question',
          blockTagTypeId: mockBlockTagTypes[1].id,
        },
        {
          blockId: 'block-3',
          title: 'Email Question',
          blockTagTypeId: mockBlockTagTypes[2].id,
        },
      ];

      // Try to assign block-tag-2 to block-4 (should fail)
      const result1 = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[1].id,
        blockTagTypeMapping,
        'block-4',
      );

      expect(result1).toEqual({
        valid: false,
        message: 'Last Name has already been selected on Last Name Question.',
      });

      // Try to assign block-tag-1 to block-1 itself (should succeed)
      const result2 = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        'block-1',
      );

      expect(result2).toEqual({ valid: true, message: '' });
    });

    it('should handle blocks switching from one block tag type to another', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
        },
      ];

      // Block-1 switching to block-tag-2 should be valid
      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[1].id,
        blockTagTypeMapping,
        'block-1',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });
  });

  describe('clearCache', () => {
    it('should clear cached block tag types', (done) => {
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      blockTagTypeService
        .loadBlockTagTypes(conferenceId)
        .then(() => {
          let types = blockTagTypeService.blockTagTypes();

          expect(types.length).toBe(4);

          // Clear cache
          blockTagTypeService.clearCache();

          // Should now only have default type
          types = blockTagTypeService.blockTagTypes();

          expect(types).toEqual([defaultBlockTagType]);
          done();
        })
        .catch(done.fail);

      $httpBackend.flush();
    });
  });
});
