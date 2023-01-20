import angular from 'angular';
import { react2angular } from 'react2angular';
import { PromoUploadPage } from './PromoUploadPage';

angular
  .module('confRegistrationWebApp')
  .component(
    'promoUploadPage',
    react2angular(
      PromoUploadPage,
      ['resolve'],
      [
        '$filter',
        '$rootScope',
        '$http',
        '$window',
        '$uibModal',
        'journalUploadService',
        'promoReportService',
        'modalMessage',
      ],
    ),
  );
