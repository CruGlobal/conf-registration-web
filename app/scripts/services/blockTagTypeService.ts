import angular from 'angular';
import { $Http, $Q } from 'injectables';

export interface BlockTagType {
  id: string | null;
  ministryId: string | null;
  name: string;
  prettyName: string;
}

export interface BlockTagTypeMapping {
  blockId: string;
  title: string;
  blockTagTypeId: string | null;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

// If you need to change this, be sure to update it in blockEditor.js as well
const familyLifeMinistryId = '9f63db46-6ca9-43b0-868a-23326b3c4d91';

export class BlockTagTypeService {
  private readonly defaultBlockTagType: BlockTagType = {
    id: null,
    ministryId: null,
    name: 'None',
    prettyName: 'None',
  };
  private cachedBlockTagTypes: BlockTagType[] = [this.defaultBlockTagType];
  private previousConferenceId: string | null = null;

  constructor(private $http: $Http, private $q: $Q) {}

  loadBlockTagTypes(
    conferenceId: string,
    ministryId: string,
  ): angular.IPromise<BlockTagType[]> {
    if (!conferenceId || ministryId !== familyLifeMinistryId) {
      return this.$q.resolve([this.defaultBlockTagType]);
    }

    if (
      this.cachedBlockTagTypes.length > 1 &&
      this.previousConferenceId === conferenceId
    ) {
      return this.$q.resolve(this.cachedBlockTagTypes);
    }

    this.previousConferenceId = conferenceId;

    return this.$http<BlockTagType[]>({
      method: 'GET',
      url: `blockTagTypes/${conferenceId}`,
    })
      .then((response) => {
        this.cachedBlockTagTypes = [this.defaultBlockTagType, ...response.data];
        return this.cachedBlockTagTypes;
      })
      .catch(() => {
        return [this.defaultBlockTagType];
      });
  }

  blockTagTypes(): BlockTagType[] {
    return this.cachedBlockTagTypes;
  }

  validateFieldSelection(
    blockTagTypeId: string | null,
    blockTagTypeMapping: BlockTagTypeMapping[],
    blockId: string,
  ): ValidationResult {
    const blockTagType = this.cachedBlockTagTypes.find(
      (type) => type.id === blockTagTypeId,
    );

    if (!blockTagType) {
      return { valid: false, message: 'Invalid block tag type.' };
    }

    // No validation needed for option 'None'
    if (blockTagType.id === null) {
      return { valid: true, message: '' };
    }

    const currentBlockTagTypeMapping = blockTagTypeMapping.find(
      (block) => block.blockTagTypeId === blockTagTypeId,
    );

    if (
      currentBlockTagTypeMapping &&
      currentBlockTagTypeMapping.blockId !== blockId
    ) {
      return {
        valid: false,
        message: `${blockTagType.prettyName} has already been selected on ${currentBlockTagTypeMapping.title}.`,
      };
    }

    return { valid: true, message: '' };
  }

  clearCache(): void {
    this.cachedBlockTagTypes = [this.defaultBlockTagType];
    this.previousConferenceId = null;
  }
}

angular
  .module('confRegistrationWebApp')
  .service('blockTagTypeService', BlockTagTypeService);
