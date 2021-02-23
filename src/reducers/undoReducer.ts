const undoReducer = (state: any, action: UndoActionType) => {
  const { past, present, future } = state;

  switch (action.type) {
    case "UNDO": {
      if (past.length === 0) return state;

      return {
        past: past.slice(0, -1),
        present: past.slice(-1)[0],
        future: [present, ...future],
      };
    }

    case "REDO": {
      if (future.length === 0) return state;

      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
    }

    case "SET": {
      if (action.newPresent === present) return state;

      return {
        past: [...past, present],
        present: action.newPresent,
        future: [],
      };
    }

    case "RESET": {
      return {
        past: [],
        present: action.newPresent,
        future: [],
      };
    }
  }
};

export default undoReducer;
