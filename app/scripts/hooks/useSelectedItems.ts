import { useCallback, useMemo, useState } from 'react';

export function useSelectedItems<Item>(): {
  // All items that are selected as a Set
  selectedItemsSet: Set<Item>;

  // All items that are selected as an array
  selectedItems: Array<Item>;

  // Set whether a single item is selected
  setSelected: (item: Item, selected: boolean) => void;

  // Set whether a multiple items are selected
  setManySelected: (items: Array<Item>, selected: boolean) => void;

  // Given an array of items, determine whether they are all selected
  allSelected: (items: Array<Item>) => boolean;

  // Unselect all account items
  reset: () => void;
} {
  const [selectedItems, setSelectedItems] = useState(new Set<Item>());

  const reset = useCallback(() => {
    setSelectedItems(new Set([]));
  }, [setSelectedItems]);

  const setManySelected = useCallback(
    (items: Array<Item>, selected: boolean) => {
      if (selected) {
        setSelectedItems(new Set([...selectedItems, ...items]));
      } else {
        setSelectedItems(
          new Set(
            Array.from(selectedItems).filter((selectedItem) =>
              items.every((item) => item !== selectedItem),
            ),
          ),
        );
      }
    },
    [selectedItems],
  );

  const setOneSelected = useCallback(
    (item: Item, selected: boolean) => {
      setManySelected([item], selected);
    },
    [setManySelected],
  );

  const allSelected = useCallback(
    (items: Array<Item>) => items.every((item) => selectedItems.has(item)),
    [selectedItems],
  );

  const selectedItemsArray = useMemo(
    () => Array.from(selectedItems),
    [selectedItems],
  );

  return {
    selectedItemsSet: selectedItems,
    selectedItems: selectedItemsArray,
    setSelected: setOneSelected,
    setManySelected,
    allSelected,
    reset,
  };
}
