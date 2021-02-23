import { useCallback, useReducer } from "react";
import { undoReducer } from "../reducers";

const useUndo = (initialPresent: any) => {
  const [state, dispatch] = useReducer(undoReducer, {
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const set = useCallback(
    (newPresent) => dispatch({ type: "SET", newPresent }),
    []
  );
  const reset = useCallback(
    (newPresent) => dispatch({ type: "RESET", newPresent }),
    []
  );

  return [state, { set, reset, undo, redo, canUndo, canRedo }];
};

export default useUndo;