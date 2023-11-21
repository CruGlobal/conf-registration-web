import angular from 'angular';
import { react2angular } from 'react2angular';
import { JournalUploadPage } from './JournalUploadPage';

angular
  .module('confRegistrationWebApp')
  .component(
    'journalUploadPage',
    react2angular(
      JournalUploadPage,
      ['resolve'],
      [
        '$filter',
        '$rootScope',
        '$http',
        '$window',
        '$uibModal',
        'journalUploadService',
        'modalMessage',
      ],
    ),
  );
