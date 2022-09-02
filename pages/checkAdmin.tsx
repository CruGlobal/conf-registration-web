// React creation
import React from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';
import 'styles/style.scss';

const checkAdmin = () => {
  return (
    <>
      <div className="row form-group">
        <div className="col-sm-4">
          <label translate="yes">Check Status</label>
          {/* 
                
                ngModel - Assignable AngularJS expression to data-bind to. 
                
                Data binding automatically keeps your page up-to-date based on your application's state. You use data binding to specify things such as the source of an image, the state of a button, or data for a particular user.

                Data binding in React - 

                    <TextField 
                        onChange={(currentPayment) => this.setState({currentPayment})}
                        value={this.state.currentPayment}
                    />
                
                */}
          <select ng-model="currentPayment.status" className="form-control">
            <option value="PENDING" translate="yes">
              Pending
            </option>
            <option value="RECEIVED" translate="yes">
              Received
            </option>
          </select>
        </div>
        <div className="col-sm-8">
          <label translate="yes">Check Number</label>
          <input
            ng-model="currentPayment.check.checkNumber"
            type="text"
            className="form-control"
          />
        </div>
      </div>
    </>
  );
};

export default checkAdmin;

angular
  .module('react.components', [])
  .component('checkAdmin', react2angular(checkAdmin, []));
