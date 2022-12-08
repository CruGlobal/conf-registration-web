import { useEffect, DependencyList, EffectCallback, useRef } from 'react';

// The callback provided to useEffect always runs on the first render. This useWatch only calls the
// callback when a dependency changes after the first render.
export function useWatch(effect: EffectCallback, deps?: DependencyList): void {
  const firstRun = useRef(true);
  return useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    } else {
      return effect();
    }
  }, deps);
}
