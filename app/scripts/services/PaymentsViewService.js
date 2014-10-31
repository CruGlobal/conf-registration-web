'use strict';

angular.module('confRegistrationWebApp')
  .service('PaymentsViewService', function PaymentsViewService(ConferenceHelper, U, $filter) {

    this.getTable = function (conference, registrations) {
      var table = [];

      var header = getHeader();

      table.push(header);

      var rows = getRows(conference, registrations);

      // sort rows by last name
      U.sortArrayByIndex(rows, _.findIndex(header, function (string) {
        return angular.equals(string, 'Last');
      }));

      table.push.apply(table, rows);

      return table;
    };

    var getHeader = function () {
      var header = [];

      header.push('First');
      header.push('Last');
      header.push('Payment');
      header.push('Type');
      header.push('Date');
      header.push('Description');

      return header;
    };

    var getRows = function (conference, registrations) {
      var rows = [];
      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      registrations.forEach(function (registration) {
        if(!registration.completed) {
          return;
        }
        var name;
        if(angular.isDefined(registration.registrants[0])) {
          name = ConferenceHelper.getRegistrantName(registration.registrants[0].answers, blocks);
        }

        if (registration.pastPayments.length > 0) {
          angular.forEach(registration.pastPayments, function (payment) {
            var row = [];
            row.push.apply(row, name);
            row.push.apply(row, ['"' + $filter('moneyFormat')(payment.amount) + '"']);
            row.push('$' + U.getValue(payment.amount, '0'));
            if(payment.paymentType === 'CREDIT_CARD') {
              row.push(U.getValue('Credit Card **' + payment.creditCard.lastFourDigits));
            } else if(payment.paymentType === 'CHECK') {
              row.push(U.getValue('Check #' + payment.check.checkNumber));
            } else if(payment.paymentType === 'SCHOLARSHIP') {
              row.push(U.getValue('Scholarship from: ' + payment.scholarship.source));
            } else if(payment.paymentType === 'TRANSFER') {
              row.push(U.getValue('Transfer from: ' + payment.transfer.source));
            } else if(payment.paymentType === 'CASH') {
                row.push(U.getValue('Cash'));
            } else if(payment.paymentType === 'CREDIT_CARD_REFUND') {
              row.push(U.getValue('Credit Card Refund **' + payment.creditCard.lastFourDigits));
            } else if(payment.paymentType === 'REFUND') {
                row.push(U.getValue('Refund'));
            }
            row.push(U.getDate(payment.transactionDatetime));
            row.push(U.getValue(payment.description));
            rows.push(row);
          });
        }
      });

      return rows;
    };
  }
);
