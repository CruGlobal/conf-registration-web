import angular from 'angular';
import { $Http, $Q } from 'injectables';

export interface IntegrationType {
  id: string | null;
  ministryId: string | null;
  name: string;
  prettyName: string;
}

export interface BlockIntegration {
  blockId: string;
  title: string;
  integrationTypeId: string | null;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export class BlockIntegrationService {
  private readonly $http: $Http;
  private readonly $q: $Q;
  private readonly defaultIntegrationType: IntegrationType = {
    id: null,
    ministryId: null,
    name: 'None',
    prettyName: 'None',
  };
  private cachedIntegrationTypes: IntegrationType[] = [
    this.defaultIntegrationType,
  ];
  private previousConferenceId: string | null = null;

  constructor($http: $Http, $q: $Q) {
    this.$http = $http;
    this.$q = $q;
  }

  loadIntegrationTypes(
    conferenceId?: string,
  ): angular.IPromise<IntegrationType[]> {
    if (!conferenceId) {
      return this.$q.resolve([this.defaultIntegrationType]);
    }

    if (
      this.cachedIntegrationTypes.length > 1 &&
      this.previousConferenceId === conferenceId
    ) {
      return this.$q.resolve(this.cachedIntegrationTypes);
    }

    this.previousConferenceId = conferenceId;

    return this.$http<IntegrationType[]>({
      method: 'GET',
      url: `blockTagTypes/${conferenceId}`,
    })
      .then((response) => {
        this.cachedIntegrationTypes = [
          this.defaultIntegrationType,
          ...response.data,
        ];
        return this.cachedIntegrationTypes;
      })
      .catch(() => {
        return [this.defaultIntegrationType];
      });
  }

  integrationTypes(): IntegrationType[] {
    return this.cachedIntegrationTypes;
  }

  validateFieldSelection(
    integrationTypeId: string | null,
    blockIntegrations: BlockIntegration[],
    blockId: string,
  ): ValidationResult {
    const integrationType = this.cachedIntegrationTypes.find(
      (type) => type.id === integrationTypeId,
    );

    if (!integrationType) {
      return { valid: false, message: 'Invalid integration type.' };
    }

    // No validation needed for option 'None'
    if (integrationType.id === null) {
      return { valid: true, message: '' };
    }

    const currentBlockIntegration = blockIntegrations.find(
      (block) => block.integrationTypeId === integrationTypeId,
    );

    if (
      currentBlockIntegration &&
      currentBlockIntegration.blockId !== blockId
    ) {
      return {
        valid: false,
        message: `${integrationType.prettyName} has already been selected on ${currentBlockIntegration.title}.`,
      };
    }

    return { valid: true, message: '' };
  }

  clearCache(): void {
    this.cachedIntegrationTypes = [this.defaultIntegrationType];
    this.previousConferenceId = null;
  }
}

angular
  .module('confRegistrationWebApp')
  .service('blockIntegrationService', BlockIntegrationService);
