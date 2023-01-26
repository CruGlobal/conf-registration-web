import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import React from 'react';
import {
  $http,
  $rootScope,
  $window,
  JournalUploadService,
  ModalMessage,
} from 'injectables';
import { Permissions } from 'permissions';
import {
  conference,
  promotionRegistrationInfoListAllErrors,
  registrationsData,
  registrationsDataWithoutErrors,
} from '../../../../__tests__/fixtures';
import { PromoReportService } from '../../services/promoReportService';
import { PromoUploadPage, PromoUploadPageProps } from './PromoUploadPage';

describe('PromoUploadPage component', () => {
  const journalUploadService = {
    getRegistrationData: jest.fn(),
  } as unknown as JournalUploadService;

  const submitPromos = jest.fn().mockReturnValue(new Promise(() => undefined));
  const loadPromoReportsPromise = Promise.resolve([]);
  const promoReportService = {
    loadAllPromoReports: jest.fn().mockReturnValue(loadPromoReportsPromise),
    submitPromos,
  } as unknown as PromoReportService;

  const props: PromoUploadPageProps = {
    $filter: jest.fn().mockReturnValue((str: string) => str),
    $rootScope: {} as $rootScope,
    $http: { get: jest.fn() } as unknown as $http,
    $window: { scrollTo: jest.fn() } as unknown as $window,
    $uibModal: { open: jest.fn() },
    journalUploadService,
    promoReportService,
    modalMessage: { error: jest.fn() } as unknown as ModalMessage,
    resolve: {
      registrationsData: registrationsDataWithoutErrors,
      conference,
      permissions: {} as Permissions,
    },
  };

  it('add all checks all', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
  });

  it('add all is still visible after adding one', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(getAllByRole('checkbox')[0]);
    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
  });

  it('remove all unselects all', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Remove All From Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: false })).toHaveLength(4);
  });

  describe('with errors', () => {
    const propsSomeErrors = cloneDeep(props);
    propsSomeErrors.resolve.registrationsData = registrationsData;

    it('hides add all when all have errors', async () => {
      const propsAllErrors = cloneDeep(props);
      propsAllErrors.resolve.registrationsData.meta.promotionRegistrationInfoList =
        promotionRegistrationInfoListAllErrors;

      const { queryByRole } = render(<PromoUploadPage {...propsAllErrors} />);

      await act(async () => {
        await loadPromoReportsPromise;
      });

      expect(
        queryByRole('button', { name: 'Add All To Promo Report' }),
      ).not.toBeInTheDocument();
    });

    it('add all only checks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <PromoUploadPage {...propsSomeErrors} />,
      );

      await act(async () => {
        await loadPromoReportsPromise;
      });

      await userEvent.click(
        getByRole('button', { name: 'Add All To Promo Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(1);
    });

    it('remove all only unchecks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <PromoUploadPage {...propsSomeErrors} />,
      );

      await act(async () => {
        await loadPromoReportsPromise;
      });

      expect(getAllByRole('checkbox')).toHaveLength(5);
      for (const checkbox of getAllByRole('checkbox') as HTMLInputElement[]) {
        // Skip checking registrants that were already checked by another registrant in the group being added
        if (!checkbox.checked) {
          await userEvent.click(checkbox);
        }
      }
      await userEvent.click(
        getByRole('button', { name: 'Remove All From Promo Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(1);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(4);
    });
  });

  it('handles submit', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(getByRole('button', { name: 'Submit Promo Upload' }));

    expect(submitPromos).toHaveBeenCalledTimes(1);
    expect(submitPromos.mock.calls[0][0]).toMatchObject([
      {
        id: 'registration-doe',
        groupRegistrants: [
          { id: 'registrant-john' },
          { id: 'registrant-jane' },
        ],
        promotions: [{ id: 'promotion-all' }, { id: 'promotion-one' }],
      },
      {
        id: 'registration-mouse',
        groupRegistrants: [
          { id: 'registrant-mickey' },
          { id: 'registrant-minnie' },
        ],
        promotions: [{ id: 'promotion-one' }],
      },
    ]);
  });
});
