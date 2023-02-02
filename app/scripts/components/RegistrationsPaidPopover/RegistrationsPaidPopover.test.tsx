import { render } from '@testing-library/react';
import { RegistrationsPaidPopover } from './RegistrationsPaidPopover';

describe('RegistrationsPaidPopover component', () => {
  it('renders', () => {
    const { getAllByRole } = render(<RegistrationsPaidPopover />);

    expect(getAllByRole('button')).toHaveLength(3);
  });
});
