import angular from 'angular';
import { $Http, $Q } from 'injectables';

export interface BlockTagType {
  id: string | null;
  ministryId: string | null;
  name: string;
  prettyName: string;
}
interface RegistrantType {
  id: string;
  name: string;
}

export interface BlockTagTypeMapping {
  blockId: string;
  title: string;
  blockTagTypeId: string | null;
  hiddenFromRegistrantTypes: RegistrantType[];
  includedInRegistrantTypes: RegistrantType[];
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

interface CoverageAnalysis {
  blocks: BlockTagTypeMapping[];
  coveredTypeIds: Set<string>;
  conflictsByBlock: Map<string, { title: string; typeNames: string[] }>;
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

  private analyzeBlockTagTypeCoverage(
    blockTagTypeId: string | null,
    blockTagTypeMapping: BlockTagTypeMapping[],
    currentBlockId?: string,
  ): CoverageAnalysis {
    const result: CoverageAnalysis = {
      blocks: [],
      coveredTypeIds: new Set<string>(),
      conflictsByBlock: new Map(),
    };

    if (blockTagTypeId === null) {
      return result;
    }

    // Find all blocks using this blockTagTypeId
    result.blocks = blockTagTypeMapping.filter(
      (mapping) => mapping.blockTagTypeId === blockTagTypeId,
    );

    if (result.blocks.length === 0) {
      return result;
    }

    // Find the current block's included types (for conflict detection)
    const currentBlock = currentBlockId
      ? blockTagTypeMapping.find((m) => m.blockId === currentBlockId)
      : undefined;

    // Analyze each block
    result.blocks.forEach((block) => {
      // Collect all covered types
      block.includedInRegistrantTypes.forEach((type) => {
        result.coveredTypeIds.add(type.id);
      });

      // Check for conflicts with current block (if provided)
      if (currentBlock && block.blockId !== currentBlockId) {
        const conflicts: string[] = [];

        block.includedInRegistrantTypes.forEach((type) => {
          const isConflict = currentBlock.includedInRegistrantTypes.some(
            (currentType) => currentType.id === type.id,
          );

          if (isConflict) {
            conflicts.push(type.name);
          }
        });

        if (conflicts.length > 0) {
          result.conflictsByBlock.set(block.blockId, {
            title: block.title,
            typeNames: conflicts,
          });
        }
      }
    });

    return result;
  }

  isBlockTagTypeFullyCovered(
    blockTagTypeId: string | null,
    blockTagTypeMapping: BlockTagTypeMapping[],
    conferenceRegistrantTypeIds: string[],
    blockId: string,
  ): boolean {
    const analysis = this.analyzeBlockTagTypeCoverage(
      blockTagTypeId,
      blockTagTypeMapping,
      blockId,
    );

    // Check if all conference registrant types are covered
    return conferenceRegistrantTypeIds.every((typeId) =>
      analysis.coveredTypeIds.has(typeId),
    );
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

    // Use shared analysis method to detect conflicts
    const analysis = this.analyzeBlockTagTypeCoverage(
      blockTagTypeId,
      blockTagTypeMapping,
      blockId,
    );

    // If no conflicts found, validation passes
    if (analysis.conflictsByBlock.size === 0) {
      return { valid: true, message: '' };
    }

    // Build error messages from conflicts
    const errorStrings: string[] = [];
    analysis.conflictsByBlock.forEach((conflict) => {
      errorStrings.push(
        `${blockTagType.prettyName} has been selected on block "${
          conflict.title
        }" with the following conflicting Registrant Types: ${conflict.typeNames.join(
          ', ',
        )}`,
      );
    });

    return {
      valid: false,
      message: errorStrings.length
        ? errorStrings.join(', ')
        : 'An error occurred.',
    };
  }

  clearCache(): void {
    this.cachedBlockTagTypes = [this.defaultBlockTagType];
    this.previousConferenceId = null;
  }
}

angular
  .module('confRegistrationWebApp')
  .service('blockTagTypeService', BlockTagTypeService);
