'use strict';

angular.module('confRegistrationWebApp')
  .service('PaymentsViewService', function PaymentsViewService(ConferenceHelper, U) {

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
      header.push('Event Cost');
      header.push('Payment');
      header.push('Type');
      header.push('Date');

      return header;
    };

    var getRows = function (conference, registrations) {
      var rows = [];

      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      ConferenceHelper.getCompletedRegistrations(registrations).forEach(function (registration) {
        var name = ConferenceHelper.getRegistrantName(registration.answers, blocks);
        var totalDue = '$' + U.getValue(registration.totalDue, '0');

        if (registration.pastPayments.length <= 0) {
          var row = [];
          row.push.apply(row, name);
          row.push(totalDue);
          rows.push(row);
        } else {
          angular.forEach(registration.pastPayments, function (payment) {
            var row = [];
            row.push.apply(row, name);
            row.push(totalDue);
            row.push('$' + U.getValue(payment.amount, '0'));
            row.push(U.getValue(payment.paymentType));
            row.push(U.getDate(payment.transactionDatetime));
            rows.push(row);
          });
        }
      });

      return rows;
    };
  }
)
;
