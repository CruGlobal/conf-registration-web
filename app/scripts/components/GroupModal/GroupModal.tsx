// React component creation

import React from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';
import 'styles/style.scss';

interface GroupModalProps {
  resolve: {
    conference: any;
    queryParameters: any;
  };
  modalInstance: {
    dismiss: () => void;
  };
}

const GroupModal = ({ resolve, modalInstance }: GroupModalProps) => {
  const { conference, queryParameters } = resolve;
  const handleClose = () => modalInstance.dismiss();

  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" onClick={handleClose}>
          &times;
        </button>
        <h4 translate="yes">{conference.name} Group</h4>
      </div>
      <div className="modal-body">
        <table className="table review-breakdown">
          <thead>
            <tr>
              <th translate="yes">Registrant</th>
              <th style={{width: 110}}><span translate="yes">Type</span></th>
              <th style={{width: 150}}></th>
            </tr>
          </thead>
          {/* how to replicate r in with react? 
              function() {

              var returnItems = r in $ctrl.getRegistration($ctrl.registrationId).groupRegistrants | orderBy: 'createdTimestamp' {
                return (
                  <li key="{r.firstName, r.lastName}">
                    <a href="{$ctrl.getRegistrantType(r.registrantTypeId).name}">{r.firstName}</a>
                    <a href="{$ctrl.getRegistrantType(r.registrantTypeId).name}">{r.lastName}</a>
                  </li>
                );
              };

              return (
                <ul>
                    {returnItems}
                  </ul>
              );
              }
          */}
          <tbody
          ng-repeat="r in $ctrl.getRegistration($ctrl.registrationId).groupRegistrants | orderBy: 'createdTimestamp'"
          >
            <tr>
              <td>
                {/* what would this code look like after replacement? */}
                {{r.firstName}} {{r.lastName}}
                <span
                  ng-if="r.id === $ctrl.getRegistration($ctrl.registrationId).primaryRegistrantId"
                  translate="yes"
                  >(Group Creator)</span
                >
              </td>
              <td>
                <span>{{$ctrl.getRegistrantType(r.registrantTypeId).name}}</span>
              </td>
              <td className="text-right">
                <input
                  type="button"
                  className="btn btn-sm btn-default btn-bold"
                  ng-click="$ctrl.editRegistrant(r)"
                  value="Edit"
                />
                <input
                  type="button"
                  className="btn btn-sm btn-danger btn-bold"
                  ng-click="$ctrl.deleteRegistrant(r)"
                  ng-if="r.id !== $ctrl.getRegistration($ctrl.registrationId).primaryRegistrantId"
                  value="Remove"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className="row reg-type-select"
          ng-repeat="type in $ctrl.visibleRegistrantTypes"
          ng-if="$ctrl.visibleRegistrantTypes.length > 1"
        >
          <div
            className="stacked-spacing-col-sm spacing-xs"
            ng-className="{'col-sm-7': type.cost>0, 'col-sm-9': type.cost==0}"
          >
            <h4>{{type.name}}</h4>
            <span className="display-linebreaks">{{type.description}}</span>
          </div>
          <div
            className="text-right"
            ng-class="{'col-sm-5': type.cost>0, 'col-sm-3': type.cost==0}"
          >
            <span className="cost" ng-if="type.cost"
              >{{type.calculatedCurrentCost |
              localizedCurrency:conference.currency.currencyCode}}</span
            >
            <a
              href=""
              ng-click="$ctrl.register(type.id)"
              className="btn btn-sm btn-success btn-important"
              ng-if="!$ctrl.registrationTypeFull(type)"
              translate="yes"
            >
              Register
            </a>
            <a
              href=""
              className="btn btn-sm btn-success btn-important btn-full"
              disabled
              ng-if="$ctrl.registrationTypeFull(type)"
              translate="yes"
            >
              Full
            </a>
          </div>
        </div>
        <div className="row" ng-if="$ctrl.visibleRegistrantTypes.length === 1">
          <div className="col-xs-12 text-center">
            <a
              href
              ng-click="$ctrl.register($ctrl.visibleRegistrantTypes[0].id)"
              className="btn btn-success btn-important btn-lg"
              ng-if="!$ctrl.registrationTypeFull($ctrl.visibleRegistrantTypes[0])"
              translate="yes"
            >
              Register
            </a>
            <p
              ng-if="$ctrl.registrationTypeFull($ctrl.visibleRegistrantTypes[0])"
              translate="yes"
            >
              Sorry, this event is full.
            </p>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button ng-click="$ctrl.dismiss()" className="btn btn-default" translate="yes">
          Close
        </button>
      </div>
    </>
  );
};

export default GroupModal;

angular
  .module('eventRegistrationWebApp', [])
  .component(
    'groupModal',
    react2angular(GroupModal, ['resolve', 'modalInstance']),
  );
