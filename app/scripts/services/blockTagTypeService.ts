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

export class BlockTagTypeService {
  private readonly $http: $Http;
  private readonly $q: $Q;
  private readonly defaultBlockTagType: BlockTagType = {
    id: null,
    ministryId: null,
    name: 'None',
    prettyName: 'None',
  };
  private cachedBlockTagTypes: BlockTagType[] = [this.defaultBlockTagType];
  private previousConferenceId: string | null = null;

  constructor($http: $Http, $q: $Q) {
    this.$http = $http;
    this.$q = $q;
  }

  loadBlockTagTypes(conferenceId?: string): angular.IPromise<BlockTagType[]> {
    if (!conferenceId) {
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
