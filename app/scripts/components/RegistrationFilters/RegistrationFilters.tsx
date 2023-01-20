import classNames from 'classnames';
import { Conference } from 'conference';
import { RegistrationQueryParams } from 'injectables';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useWatch } from '../../../scripts/hooks/useWatch';
import { Pagination } from '../Pagination/Pagination';

export interface RegistrationFiltersProps {
  defaultQueryParams: RegistrationQueryParams;
  conference: Conference;
  onQueryChange: (filters: RegistrationQueryParams) => unknown;
  showPagination: boolean;
  pageCount: number;
  children: React.ReactFragment;
  hiddenFilters?: Array<keyof RegistrationQueryParams>;
}

export const RegistrationFilters = (
  props: RegistrationFiltersProps,
): JSX.Element => {
  const [queryParameters, setQueryParameters] = useState(
    props.defaultQueryParams,
  );

  const setQueryParam = <Key extends keyof RegistrationQueryParams>(
    key: Key,
    value: RegistrationQueryParams[Key],
  ) => {
    const newQueryParams = {
      ...queryParameters,
      [key]: value,
      // Reset to the first page if a filter besides the page changes
      ...(key === 'page' ? null : { page: 1 }),
    };
    setQueryParameters(newQueryParams);
    props.onQueryChange(newQueryParams);
  };

  const [strFilterInput, setStrFilterInput] = useState('');
  const [strFilter, setStrFilter] = useState('');
  const setStrFilterDebounced = useCallback(debounce(setStrFilter, 500), []);
  useWatch(() => {
    // When the filter input value changes, update the strFilter but with debouncing
    setStrFilterDebounced(strFilterInput);
    return () => {
      setStrFilterDebounced.cancel();
    };
  }, [strFilterInput]);
  useWatch(() => {
    // When the strFilter input value changes, update the query parameter
    setQueryParam('filter', strFilter);
  }, [strFilter]);

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const showFilter = (filterName: keyof RegistrationQueryParams) =>
    !props.hiddenFilters?.includes(filterName);

  return (
    <>
      <div className="row form-group well well-full spacing-above-xs spacing-below-sm registration-filters">
        <div className="filters-row row">
          {showFilter('filter') && (
            <div className="col-md-2 col-sm-8 stacked-spacing-col-md">
              <div className="form-group has-feedback has-clear">
                <label>
                  Search <small>(visible columns only)</small>:
                  <input
                    type="text"
                    className="form-control"
                    value={strFilterInput}
                    onChange={(event) => {
                      setStrFilterInput(event.target.value);
                    }}
                  />
                </label>
                {strFilterInput && (
                  <span
                    className="form-control-feedback form-control-clear"
                    onClick={() => {
                      setStrFilterInput('');
                    }}
                    title="Clear search"
                  >
                    <i className="fa fa-times" />
                  </span>
                )}
              </div>
            </div>
          )}
          {showFilter('filterPayment') && (
            <div className="col-md-2 col-sm-4 stacked-spacing-col-sm">
              <label>
                Payment status:
                <select
                  className="form-control"
                  data-testid="registration-filters-payment"
                  value={queryParameters.filterPayment}
                  onChange={(event) =>
                    setQueryParam('filterPayment', event.target.value)
                  }
                >
                  <option value="">-Any-</option>
                  <option value="full">Full/Overpaid</option>
                  <option value="partial">Partial</option>
                  <option value="full-partial">Full/Partial</option>
                  <option value="over">Overpaid</option>
                </select>
              </label>
            </div>
          )}
          {showFilter('filterRegType') && (
            <div className="col-md-2 col-sm-6 stacked-spacing-col-sm">
              <label>
                Registrant type:
                <select
                  className="form-control"
                  data-testid="registration-filters-registrant-type"
                  value={queryParameters.filterRegType}
                  onChange={(event) =>
                    setQueryParam('filterRegType', event.target.value)
                  }
                >
                  <option value="">-Any-</option>
                  {props.conference.registrantTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {showFilter('filterAccountTransfersByPaymentType') && (
            <div className="col-md-2 col-sm-6 stacked-spacing-col-sm">
              <label>
                Payment type:
                <select
                  className="form-control"
                  value={queryParameters.filterAccountTransfersByPaymentType}
                  onChange={(event) =>
                    setQueryParam(
                      'filterAccountTransfersByPaymentType',
                      event.target.value,
                    )
                  }
                >
                  <option value="">-Any-</option>
                  <option value="ACCOUNT_TRANSFER">Account Transfer</option>
                  <option value="SCHOLARSHIP">Scholarship</option>
                </select>
              </label>
            </div>
          )}
          {showFilter('filterAccountTransfersByExpenseType') && (
            <div className="col-md-2 col-sm-6 stacked-spacing-col-sm">
              <label>
                Expense type:
                <select
                  className="form-control"
                  value={queryParameters.filterAccountTransfersByExpenseType}
                  onChange={(event) =>
                    setQueryParam(
                      'filterAccountTransfersByExpenseType',
                      event.target.value,
                    )
                  }
                >
                  <option value="">-Any-</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="MISCELLANEOUS_ITEM">Misc. Expense</option>
                  <option value="CHILDCARE">Childcare</option>
                  <option value="STAFF_TAXABLE_ITEM">
                    Staff Taxable Expense
                  </option>
                </select>
              </label>
            </div>
          )}
          <div className="more-filters col-md-2 col-sm-6 text-right stacked-spacing-col-md">
            <br />
            <Button
              className="btn btn-default"
              active={showMoreFilters}
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              <span className="margin-right-xs">Filters</span>
              <i
                className={classNames(
                  'fa',
                  showMoreFilters ? 'fa-chevron-up' : 'fa-chevron-down',
                )}
              />
            </Button>
          </div>
        </div>
        {showMoreFilters && (
          <div className="row spacing-above-sm well-border-above">
            {showFilter('filterAccountTransferErrors') && (
              <div className="col-sm-3 stacked-spacing-col-sm">
                <label>
                  Journal Submission Errors
                  <ToggleButtonGroup
                    type="radio"
                    name="filterAccountTransferErrors"
                    className="btn-group-justified"
                    value={queryParameters.filterAccountTransferErrors}
                    onChange={(value) =>
                      setQueryParam('filterAccountTransferErrors', value)
                    }
                  >
                    <ToggleButton value="yes">Show</ToggleButton>
                    <ToggleButton value="no">Hide</ToggleButton>
                    <ToggleButton value="only">Only</ToggleButton>
                  </ToggleButtonGroup>
                </label>
              </div>
            )}
            {showFilter('includeIncomplete') && (
              <div className="col-sm-3 stacked-spacing-col-sm">
                <label>
                  Incomplete registrations
                  <ToggleButtonGroup
                    type="radio"
                    name="includeIncomplete"
                    className="btn-group-justified"
                    value={queryParameters.includeIncomplete}
                    onChange={(value) =>
                      setQueryParam('includeIncomplete', value)
                    }
                  >
                    <ToggleButton value="yes">Show</ToggleButton>
                    <ToggleButton value="no">Hide</ToggleButton>
                    <ToggleButton value="only">Only</ToggleButton>
                  </ToggleButtonGroup>
                </label>
              </div>
            )}
            {showFilter('includeCheckedin') && (
              <div className="col-sm-3 stacked-spacing-col-sm">
                <label>
                  Checked-in registrations
                  <ToggleButtonGroup
                    type="radio"
                    name="includeCheckedin"
                    className="btn-group-justified"
                    value={queryParameters.includeCheckedin}
                    onChange={(value) =>
                      setQueryParam('includeCheckedin', value)
                    }
                  >
                    <ToggleButton value="yes">Show</ToggleButton>
                    <ToggleButton value="no">Hide</ToggleButton>
                    <ToggleButton value="only">Only</ToggleButton>
                  </ToggleButtonGroup>
                </label>
              </div>
            )}
            {showFilter('includeWithdrawn') && (
              <div className="col-sm-3 stacked-spacing-col-sm">
                <label>
                  Withdrawn registrations
                  <ToggleButtonGroup
                    type="radio"
                    name="includeWithdrawn"
                    className="btn-group-justified"
                    value={queryParameters.includeWithdrawn}
                    onChange={(value) =>
                      setQueryParam('includeWithdrawn', value)
                    }
                  >
                    <ToggleButton value="yes">Show</ToggleButton>
                    <ToggleButton value="no">Hide</ToggleButton>
                    <ToggleButton value="only">Only</ToggleButton>
                  </ToggleButtonGroup>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
      {props.children}
      {props.showPagination && (
        <div className="row spacing-above-xs">
          <div className="col-sm-4 spacing-xs spacing-above-md">
            <ToggleButtonGroup
              type="radio"
              name="limit"
              value={queryParameters.limit}
              onChange={(value) => setQueryParam('limit', value)}
            >
              <ToggleButton value={20}>20</ToggleButton>
              <ToggleButton value={50}>50</ToggleButton>
              <ToggleButton value={100}>100</ToggleButton>
              <ToggleButton value={0} disabled>
                per page
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="col-sm-8 text-right">
            <Pagination
              className="pagination"
              activePage={queryParameters.page}
              pageCount={props.pageCount}
              onChange={(page) => setQueryParam('page', page)}
            />
          </div>
        </div>
      )}
    </>
  );
};
