import React, { useMemo } from 'react';
import { PromoRegistration } from 'promoRegistration';
import {
  PromotionRow,
  TransactionsTable,
  TransactionsTableProps,
} from '../TransactionsTable/TransactionsTable';

export interface PromoTransactionsTableProps
  extends Omit<TransactionsTableProps<'promotion'>, 'rowType' | 'rows'> {
  promoRegistrations: Array<PromoRegistration>;
}

export const PromoTransactionsTable = ({
  promoRegistrations,
  ...props
}: PromoTransactionsTableProps): JSX.Element => {
  const rows = useMemo(
    () =>
      // Expand each registration item into one row per registrant in the registration
      promoRegistrations.flatMap((promoRegistration) => {
        const { registration, promotion } = promoRegistration;
        return (
          registration.groupRegistrants
            // If the promotion doesn't apply to all registrations, filter out the non-primary registrants
            .filter(
              (registrant) =>
                promotion.applyToAllRegistrants ||
                registrant.id === registration.primaryRegistrantId,
            )
            .map(
              (registrant): PromotionRow => ({
                type: 'promotion',
                id: `${registrant.id}|${promotion.id}`,
                registrationId: registration.id,
                remainingBalance: registration.remainingBalance,
                error: promoRegistration.error,
                firstName: registrant.firstName,
                lastName: registrant.lastName,
                businessUnit: promotion.businessUnit,
                operatingUnit: promotion.operatingUnit,
                departmentId: promotion.departmentId,
                projectId: promotion.projectId,
                amount: promotion.amount,
                description: `${promotion.code} ${registrant.lastName}, ${registrant.firstName}`,
                transaction: promoRegistration,
              }),
            )
        );
      }),
    [promoRegistrations],
  );

  return <TransactionsTable rows={rows} rowType="promotion" {...props} />;
};
