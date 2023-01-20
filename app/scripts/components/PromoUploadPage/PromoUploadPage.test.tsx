import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  conference,
  registrationsDataWithoutErrors as registrationsData,
} from '../../../../__tests__/fixtures';
import { PromoUploadPage, PromoUploadPageProps } from './PromoUploadPage';
import { PromoReportService } from '../../services/promoReportService';
import {
  $http,
  $rootScope,
  $window,
  JournalUploadService,
  ModalMessage,
} from 'injectables';
import { Permissions } from 'permissions';

describe('PromoUploadPage component', () => {
  const journalUploadService = {
    getRegistrationData: jest.fn(),
  } as unknown as JournalUploadService;

  const submitPromos = jest.fn().mockReturnValue(new Promise(() => undefined));
  const promoReportService = {
    loadAllPromoReports: jest.fn().mockResolvedValue([]),
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
      registrationsData,
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

  it('add all is visible after adding one', async () => {
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
