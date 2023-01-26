import { act, renderHook } from '@testing-library/react-hooks';
import { useQuery } from './useQuery';

const makePromise = <Type>() => {
  let resolver: (value: Type) => void;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  // @ts-expect-error
  return { promise, resolve: resolver };
};

describe('useQuery', () => {
  it('loading is true while a request is loading', async () => {
    const loadPromise = Promise.resolve(0);
    let variables = 0;
    const { result, rerender } = renderHook(() =>
      useQuery({
        defaultData: null,
        load: () => loadPromise,
        variables,
      }),
    );

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await loadPromise;
    });

    expect(result.current.loading).toBe(false);

    variables = 1;
    rerender();

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await loadPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('data is defaultData until a request loads', async () => {
    let loadPromise = Promise.resolve(0);
    let variables = 0;
    const { result, rerender } = renderHook(() =>
      useQuery({
        defaultData: null,
        load: () => loadPromise,
        variables,
      }),
    );

    expect(result.current.data).toBeNull();

    await act(async () => {
      await loadPromise;
    });

    expect(result.current.data).toBe(0);

    loadPromise = Promise.resolve(1);
    variables = 1;
    rerender();

    expect(result.current.data).toBe(0);

    await act(async () => {
      await loadPromise;
    });

    expect(result.current.data).toBe(1);
  });

  describe('disabled query', () => {
    it('never loads', () => {
      const load = jest.fn(() => new Promise(() => undefined));
      let variables = 0;
      const { rerender } = renderHook(() =>
        useQuery({
          defaultData: null,
          enabled: false,
          load,
          variables,
        }),
      );

      expect(load).not.toHaveBeenCalled();

      variables = 1;
      rerender();

      expect(load).not.toHaveBeenCalled();
    });

    it('aborts in-progress query', () => {
      const load = () => new Promise(() => undefined);
      let enabled = true;
      const { result, rerender } = renderHook(() =>
        useQuery({
          defaultData: null,
          enabled,
          load,
          variables: 0,
        }),
      );

      expect(result.current.loading).toBe(true);

      enabled = false;
      rerender();

      expect(result.current.loading).toBe(false);
    });
  });

  it('refreshes the query', async () => {
    const loadPromise = Promise.resolve(0);
    const load = jest.fn(() => loadPromise);
    const { result } = renderHook(() =>
      useQuery({
        defaultData: null,
        load,
        variables: 0,
      }),
    );

    expect(load).toHaveBeenCalledTimes(1);

    await act(async () => {
      await loadPromise;
    });

    await act(async () => {
      result.current.refresh();
      await loadPromise;
    });

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('handles concurrent loads', async () => {
    let variables = 1;
    const { promise: loadPromise1, resolve: resolve1 } = makePromise<number>();
    const { promise: loadPromise2, resolve: resolve2 } = makePromise<number>();
    const load = jest.fn(() => new Promise(() => undefined));
    load.mockReturnValueOnce(loadPromise1);
    load.mockReturnValueOnce(loadPromise2);
    const { result, rerender } = renderHook(() =>
      useQuery({
        defaultData: null,
        load,
        variables,
      }),
    );

    variables = 2;
    rerender();

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    resolve2(2);
    await act(async () => {
      await loadPromise2;
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(2);

    resolve1(1);
    await act(async () => {
      await loadPromise1;
    });

    // Check that data is the value of the second query even after the first query finishes
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(2);
  });
});
