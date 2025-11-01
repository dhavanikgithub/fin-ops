'use client';
import { useState, useRef, useCallback } from 'react';

function useStateWithRef<T>(initialValue: T) {
    const [state, setState] = useState<T>(initialValue);
    const ref = useRef<T>(initialValue);

    const setStateWithRef = useCallback((value: T) => {
        ref.current = value;
        setState(value);
    }, []);

    return [state, setStateWithRef, ref] as const;
}

export default useStateWithRef;