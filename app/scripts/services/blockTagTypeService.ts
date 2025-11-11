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

  /**
   * Load block tag types for a specific conference and ministry.
   * Results are cached per conference to avoid redundant API calls.
   *
   * @param conferenceId - The ID of the conference
   * @param ministryId - The ID of the ministry (must match FamilyLife ministry ID)
   * @returns Promise resolving to an array of BlockTagType objects, including the default "None" option
   *
   * @remarks
   * - Returns only the default "None" type if conferenceId is missing or ministry is not FamilyLife
   */
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

  /**
   * Get the currently cached block tag types.
   *
   * @returns Array of BlockTagType objects
   *
   * @remarks
   * Returns cached data without making any API calls.
   */
  blockTagTypes(): BlockTagType[] {
    return this.cachedBlockTagTypes;
  }

  /**
   * Analyze coverage and conflicts for a blockTagType.
   * This is a private helper that both validation and coverage checking use.
   *
   * @param blockTagTypeId - The ID of the blockTagType to analyze
   * @param blockTagTypeMapping - Array of all block mappings
   * @param currentBlockId - Optional ID of the current block (to exclude from conflict checking)
   * @returns Analysis containing blocks using this type, covered type IDs, and conflicts
   */
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

  /**
   * Check if a blockTagType is fully covered across all conference registrant types.
   * A blockTagType is "fully covered" when the combined includedInRegistrantTypes
   * from all blocks using this blockTagType include ALL conference registrant types.
   *
   * @param blockTagTypeId - The ID of the blockTagType to check
   * @param blockTagTypeMapping - Array of all block mappings
   * @param conferenceRegistrantTypeIds - Array of all registrant type IDs in the conference
   * @param blockId - The ID of the block being evaluated
   * @returns true if all conference registrant types are covered by this blockTagType
   */
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

  /**
   * Validate whether a block can use a specific blockTagType.
   * Checks for registrant type conflicts with other blocks using the same blockTagType.
   *
   * @param blockTagTypeId - The ID of the blockTagType to validate (or null for "None")
   * @param blockTagTypeMapping - Array of all block mappings in the conference
   * @param blockId - The ID of the block attempting to use this blockTagType
   * @returns ValidationResult object containing whether selection is valid and any error messages
   *
   * @remarks
   * - Always returns valid for "None" selection (null blockTagTypeId)
   * - Returns invalid if blockTagTypeId doesn't exist in cached types
   * - Checks if any other blocks using the same blockTagType have overlapping registrant types
   * - Returns detailed error messages listing which blocks and registrant types conflict
   *
   * @example
   * ```typescript
   * const result = service.validateFieldSelection('TYPE1', mappings, 'block-123');
   * if (!result.valid) {
   *   console.error(result.message); // "Type 1 has been selected on block "Name" with conflicting types: Default, Staff"
   * }
   * ```
   */
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

  /**
   * Clear all cached block tag types and reset to default state.
   *
   * @remarks
   * - Resets cachedBlockTagTypes to only contain the default "None" option
   * - Clears the previousConferenceId, forcing a fresh API call on next load
   */
  clearCache(): void {
    this.cachedBlockTagTypes = [this.defaultBlockTagType];
    this.previousConferenceId = null;
  }
}

angular
  .module('confRegistrationWebApp')
  .service('blockTagTypeService', BlockTagTypeService);
