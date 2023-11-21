import { render } from '@testing-library/react';
import { FormStatusPopover } from './FormStatusPopover';

describe('FormStatusPopover component', () => {
  it('renders', () => {
    const { getAllByRole } = render(<FormStatusPopover />);

    expect(getAllByRole('button')).toHaveLength(4);
  });
});
