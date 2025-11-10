import 'angular-mocks';
import { familyLifeMinistryId } from '../../../app/scripts/directives/blockEditor';

describe('Service: BlockTagTypeService', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let blockTagTypeService, $httpBackend, $rootScope, testData;

  beforeEach(inject((
    _blockTagTypeService_,
    _$httpBackend_,
    _$rootScope_,
    _testData_,
  ) => {
    blockTagTypeService = _blockTagTypeService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    testData = _testData_;
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
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
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
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
        .then((types) => {
          expect(types.length).toBe(4);

          // Second call - should use cache, no new API call
          blockTagTypeService
            .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
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
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
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
      blockTagTypeService
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
        .then((types) => {
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
        .loadBlockTagTypes(otherConferenceId, familyLifeMinistryId)
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

      blockTagTypeService
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
        .then(() => {
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
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [],
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
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [],
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        'block-1',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return valid if same tag type is selected on another block but there registrant types do not overlap', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            {
              id: '2534d7fe-cac6-4807-8f50-1140ae40d652',
              name: 'Spouse',
            },
            {
              id: '8122b447-fabf-4dc0-85de-f0e642995552',
              name: 'Child',
            },
          ],
          includedInRegistrantTypes: [
            {
              id: '9381010c-b56e-46fb-8364-ad27dcbcbf90',
              name: 'Default',
            },
          ],
        },
        {
          blockId: 'block-2',
          title: 'Second Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            {
              id: '9381010c-b56e-46fb-8364-ad27dcbcbf90',
              name: 'Default',
            },
          ],
          includedInRegistrantTypes: [
            {
              id: '2534d7fe-cac6-4807-8f50-1140ae40d652',
              name: 'Spouse',
            },
            {
              id: '8122b447-fabf-4dc0-85de-f0e642995552',
              name: 'Child',
            },
          ],
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[1].id,
        blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return valid if same tag type is selected on 2 or more blocks, but their registrant types do not overlap', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            {
              id: '2534d7fe-cac6-4807-8f50-1140ae40d652',
              name: 'Spouse',
            },
            {
              id: '8122b447-fabf-4dc0-85de-f0e642995552',
              name: 'Child',
            },
            {
              id: '9be0074a-14aa-4ecd-8a03-010a198f846a',
              name: 'Couple',
            },
          ],
          includedInRegistrantTypes: [
            {
              id: '9381010c-b56e-46fb-8364-ad27dcbcbf90',
              name: 'Default',
            },
          ],
        },
        {
          blockId: 'block-2',
          title: 'Second Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            {
              id: '9381010c-b56e-46fb-8364-ad27dcbcbf90',
              name: 'Default',
            },
            {
              id: '9be0074a-14aa-4ecd-8a03-010a198f846a',
              name: 'Couple',
            },
          ],
          includedInRegistrantTypes: [
            {
              id: '2534d7fe-cac6-4807-8f50-1140ae40d652',
              name: 'Spouse',
            },
            {
              id: '8122b447-fabf-4dc0-85de-f0e642995552',
              name: 'Child',
            },
          ],
        },
        {
          blockId: 'block-3',
          title: 'Third Name Question',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            {
              id: '9381010c-b56e-46fb-8364-ad27dcbcbf90',
              name: 'Default',
            },
            {
              id: '2534d7fe-cac6-4807-8f50-1140ae40d652',
              name: 'Spouse',
            },
            {
              id: '8122b447-fabf-4dc0-85de-f0e642995552',
              name: 'Child',
            },
          ],
          includedInRegistrantTypes: [
            {
              id: '9be0074a-14aa-4ecd-8a03-010a198f846a',
              name: 'Couple',
            },
          ],
        },
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[1].id,
        blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({ valid: true, message: '' });
    });

    it('should return invalid if same tag type is selected on 1 block, but their registrant types do overlap', () => {
      const blockTagTypeMapping = [
        testData.blockTagTypeMapping[0],
        testData.blockTagTypeMapping[1],
      ];

      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({
        valid: false,
        message:
          'First Name has been selected on block "First Name Question" with the following conflicting Registrant Types: Default',
      });
    });

    it('should return invalid if same tag type is selected on multiple blocks, but their registrant types do overlap', () => {
      const result = blockTagTypeService.validateFieldSelection(
        mockBlockTagTypes[0].id,
        testData.blockTagTypeMapping,
        'block-2',
      );

      expect(result).toEqual({
        valid: false,
        message:
          'First Name has been selected on block "First Name Question" with the following conflicting Registrant Types: Default, First Name has been selected on block "Third Name Question" with the following conflicting Registrant Types: Child',
      });
    });
  });

  describe('isBlockTagTypeFullyCovered', () => {
    it('should not be disabled for null blockTagTypeId', () => {
      const blockTagTypeMapping = [];
      const conferenceRegistrantTypeIds = ['type-1', 'type-2', 'type-3'];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        null,
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(false);
    });

    it('should not be disabled when blockTagType is not assigned to any blocks', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [{ id: 'type-1', name: 'Type 1' }],
        },
      ];
      const conferenceRegistrantTypeIds = ['type-1', 'type-2', 'type-3'];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        mockBlockTagTypes[1].id, // Different blockTagType that's not used
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(false);
    });

    it('should be disabled when a single block covers all registrant types', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [
            { id: 'type-1', name: 'Type 1' },
            { id: 'type-2', name: 'Type 2' },
            { id: 'type-3', name: 'Type 3' },
          ],
        },
      ];
      const conferenceRegistrantTypeIds = ['type-1', 'type-2', 'type-3'];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(true);
    });

    it('should not be disabled when a single block covers only some registrant types', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [{ id: 'type-3', name: 'Type 3' }],
          includedInRegistrantTypes: [
            { id: 'type-1', name: 'Type 1' },
            { id: 'type-2', name: 'Type 2' },
          ],
        },
      ];
      const conferenceRegistrantTypeIds = ['type-1', 'type-2', 'type-3'];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(false);
    });

    it('should be disabled true when multiple blocks together cover all registrant types', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [{ id: 'type-3', name: 'Type 3' }],
          includedInRegistrantTypes: [
            { id: 'type-1', name: 'Type 1' },
            { id: 'type-2', name: 'Type 2' },
          ],
        },
        {
          blockId: 'block-2',
          title: 'Last Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            { id: 'type-1', name: 'Type 1' },
            { id: 'type-2', name: 'Type 2' },
          ],
          includedInRegistrantTypes: [{ id: 'type-3', name: 'Type 3' }],
        },
      ];
      const conferenceRegistrantTypeIds = ['type-1', 'type-2', 'type-3'];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(true);
    });

    it('should not be disabled when multiple blocks together do not cover all registrant types', () => {
      const blockTagTypeMapping = [
        {
          blockId: 'block-1',
          title: 'First Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            { id: 'type-2', name: 'Type 2' },
            { id: 'type-3', name: 'Type 3' },
          ],
          includedInRegistrantTypes: [{ id: 'type-1', name: 'Type 1' }],
        },
        {
          blockId: 'block-2',
          title: 'Last Name',
          blockTagTypeId: mockBlockTagTypes[0].id,
          hiddenFromRegistrantTypes: [
            { id: 'type-1', name: 'Type 1' },
            { id: 'type-3', name: 'Type 3' },
          ],
          includedInRegistrantTypes: [{ id: 'type-2', name: 'Type 2' }],
        },
      ];
      const conferenceRegistrantTypeIds = [
        'type-1',
        'type-2',
        'type-3',
        'type-4',
      ];

      const isDisabled = blockTagTypeService.isBlockTagTypeFullyCovered(
        mockBlockTagTypes[0].id,
        blockTagTypeMapping,
        conferenceRegistrantTypeIds,
      );

      expect(isDisabled).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear cached block tag types', (done) => {
      $httpBackend
        .expectGET(`blockTagTypes/${conferenceId}`)
        .respond(200, mockBlockTagTypes);

      blockTagTypeService
        .loadBlockTagTypes(conferenceId, familyLifeMinistryId)
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
