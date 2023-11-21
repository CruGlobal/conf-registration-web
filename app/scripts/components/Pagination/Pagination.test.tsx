import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination component', () => {
  it('renders', () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <Pagination activePage={1} pageCount={2} onChange={onChange} />,
    );

    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByText('Next')).toBeInTheDocument();
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
    expect(queryByText('3')).not.toBeInTheDocument();
  });

  describe('previous', () => {
    it('handles clicks', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={2} pageCount={3} onChange={onChange} />,
      );

      await userEvent.click(getByText('Previous'));

      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('disables at first page', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={1} pageCount={3} onChange={onChange} />,
      );

      await userEvent.click(getByText('Previous'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('next', () => {
    it('handles clicks', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={2} pageCount={3} onChange={onChange} />,
      );

      await userEvent.click(getByText('Next'));

      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('disables at last page', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={3} pageCount={3} onChange={onChange} />,
      );

      await userEvent.click(getByText('Next'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('page previous', () => {
    it('advances when first page in set is active', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={16} pageCount={20} onChange={onChange} />,
      );

      await userEvent.click(getByText('…'));

      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('advances when last page in set is active', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={20} pageCount={20} onChange={onChange} />,
      );

      await userEvent.click(getByText('…'));

      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('is hidden in first page set', () => {
      const onChange = jest.fn();
      const { queryByTestId } = render(
        <Pagination activePage={1} pageCount={20} onChange={onChange} />,
      );

      expect(queryByTestId('pagination-page-previous')).not.toBeInTheDocument();
    });
  });

  describe('page next', () => {
    it('advances when first page in set is active', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={1} pageCount={20} onChange={onChange} />,
      );

      await userEvent.click(getByText('…'));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('advances when last page in set is active', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={5} pageCount={20} onChange={onChange} />,
      );

      await userEvent.click(getByText('…'));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('is hidden in last page set', () => {
      const onChange = jest.fn();
      const { queryByTestId } = render(
        <Pagination activePage={20} pageCount={20} onChange={onChange} />,
      );

      expect(queryByTestId('pagination-page-next')).not.toBeInTheDocument();
    });
  });

  describe('page buttons', () => {
    it('handles clicks', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <Pagination activePage={1} pageCount={20} onChange={onChange} />,
      );

      await userEvent.click(getByText('3'));

      expect(onChange).toHaveBeenCalledWith(3);
      onChange.mockReset();

      await userEvent.click(getByText('5'));

      expect(onChange).toHaveBeenCalledWith(5);
      onChange.mockReset();
    });
  });
});
