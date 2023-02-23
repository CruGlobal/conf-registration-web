import { Conference } from 'conference';
import { $Http, $UibModal, ModalMessage } from 'injectables';
import { Permissions } from 'permissions';
import { PromotionRegistrationInfo } from 'promotionReport';
import { Registration } from 'registration';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';

export const usePaymentsModal = ({
  $http,
  $uibModal,
  modalMessage,
  conference,
  permissions,
}: {
  $http: $Http;
  $uibModal: $UibModal;
  modalMessage: ModalMessage;
  conference: Conference;
  permissions: Permissions;
}): {
  // Open the payments modal for a given registration
  // The promotionRegistrationInfoList is used to to disable deletion of posted promotions
  open: (
    registrationId: string,
    promotionRegistrationInfoList: PromotionRegistrationInfo[],
  ) => Promise<void>;
} => {
  const open = async (
    registrationId: string,
    promotionRegistrationInfoList: PromotionRegistrationInfo[],
  ): Promise<void> => {
    const response = await $http
      .get<Registration>('registrations/' + registrationId)
      .catch(() => {
        modalMessage.error('Error: registration data could not be retrieved.');
      });
    if (!response) {
      return;
    }

    await $uibModal
      .open({
        templateUrl: paymentsModalTemplate,
        controller: 'paymentModal',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          registration: () => response.data,
          promotionRegistrationInfoList: () => promotionRegistrationInfoList,
          conference: () => conference,
          permissions: () => permissions,
        },
      })
      // Ignore rejections from the escape key
      .result.catch(() => undefined);
  };

  return { open };
};
