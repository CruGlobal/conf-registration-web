import { act, renderHook } from '@testing-library/react-hooks';
import { $Http, $UibModal, ModalMessage } from 'injectables';
import { Permissions } from 'permissions';
import { PromotionRegistrationInfo } from 'promotionReport';
import { conference, registrationDoe } from '../../../__tests__/fixtures';
import { usePaymentsModal } from './usePaymentsModal';

const get = jest.fn();
const $http = {
  get,
} as unknown as $Http;

const open = jest.fn();
const $uibModal = {
  open,
} as unknown as $UibModal;

const error = jest.fn();
const modalMessage = {
  error,
} as unknown as ModalMessage;

const permissions = {} as Permissions;

describe('usePaymentsModal', () => {
  it('loads the registration data and opens the modal', async () => {
    const { result } = renderHook(() =>
      usePaymentsModal({
        $http,
        $uibModal,
        modalMessage,
        conference,
        permissions,
      }),
    );

    const promotionRegistrationInfoList: PromotionRegistrationInfo[] = [];

    const getPromise = Promise.resolve({ data: registrationDoe });
    get.mockReturnValue(getPromise);

    const openPromise = Promise.resolve();
    open.mockImplementation(({ resolve }) => {
      expect(resolve.registration()).toBe(registrationDoe);
      expect(resolve.promotionRegistrationInfoList()).toBe(
        promotionRegistrationInfoList,
      );

      expect(resolve.conference()).toBe(conference);
      expect(resolve.permissions()).toBe(permissions);
      return { result: openPromise };
    });

    result.current.open(registrationDoe.id, promotionRegistrationInfoList);
    await act(async () => {
      await Promise.all([getPromise, openPromise]);
    });

    expect(open).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('registrations/registration-doe');
  });

  it('shows a message if loading fails', async () => {
    const { result } = renderHook(() =>
      usePaymentsModal({
        $http,
        $uibModal,
        modalMessage,
        conference,
        permissions,
      }),
    );

    const getPromise = Promise.reject('Network error');
    get.mockReturnValue(getPromise);

    const returnPromise = result.current.open(registrationDoe.id, []);

    await act(async () => {
      await getPromise.catch(() => undefined);
    });

    expect(error).toHaveBeenCalledWith(
      'Error: registration data could not be retrieved.',
    );

    expect(open).not.toHaveBeenCalled();
    expect(returnPromise).resolves.toBeUndefined();
  });

  it('succeeds even if open rejects', async () => {
    const { result } = renderHook(() =>
      usePaymentsModal({
        $http,
        $uibModal,
        modalMessage,
        conference,
        permissions,
      }),
    );

    const getPromise = Promise.resolve({});
    get.mockReturnValue(getPromise);

    const openPromise = Promise.reject();
    open.mockReturnValue({ result: openPromise });

    const returnPromise = result.current.open(registrationDoe.id, []);

    await act(async () => {
      await Promise.all([getPromise, openPromise.catch(() => undefined)]);
    });

    expect(returnPromise).resolves.toBeUndefined();
  });
});
