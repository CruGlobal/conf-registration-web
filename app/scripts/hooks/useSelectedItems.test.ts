import { act, renderHook } from '@testing-library/react-hooks';
import { useSelectedItems } from './useSelectedItems';

describe('useSelectedItems', () => {
  it('no items are selected initially', () => {
    const { result } = renderHook(() => useSelectedItems<number>());

    expect(result.current.selectedItemsSet.size).toBe(0);
    expect(result.current.selectedItems.length).toBe(0);
  });

  it('selects individual items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setSelected(0, true);
      result.current.setSelected(2, true);
    });

    expect(result.current.selectedItems).toEqual([0, 2]);
  });

  it('selects multiple items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 2], true);
    });

    expect(result.current.selectedItems).toEqual([0, 2]);
  });

  it('deselects individual items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 1, 2], true);
      result.current.setSelected(0, false);
    });

    expect(result.current.selectedItems).toEqual([1, 2]);
  });

  it('deselects multiple items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 1, 2], true);
      result.current.setManySelected([0, 2], false);
    });

    expect(result.current.selectedItems).toEqual([1]);
  });

  it('deduplicates selected items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 2], true);
      result.current.setManySelected([1, 2], true);
    });

    expect(result.current.selectedItems).toEqual([0, 2, 1]);
  });

  it('resets selected items', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 1, 2], true);
      result.current.reset();
    });

    expect(result.current.selectedItems.length).toBe(0);
  });

  it('calculates whether all items are selected', () => {
    const { result } = renderHook(() => useSelectedItems<number>());
    act(() => {
      result.current.setManySelected([0, 1, 2], true);
    });

    expect(result.current.allSelected([2, 1, 0])).toBe(true);
    expect(result.current.allSelected([2, 0])).toBe(true);
    expect(result.current.allSelected([0, 3])).toBe(false);
  });
});
