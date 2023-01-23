import { renderHook } from '@testing-library/react-hooks';
import { useWatch } from './useWatch';

describe('useWatch', () => {
  it('calls on change', () => {
    let value = 0;
    const callback = jest.fn();
    const { rerender } = renderHook(() => useWatch(callback, [value]));

    value = 1;
    rerender();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call on first render', () => {
    const callback = jest.fn();
    renderHook(() => useWatch(callback, [0]));

    expect(callback).not.toHaveBeenCalled();
  });
});
