import { Action, AnyAction, Dispatch, Middleware } from 'redux';

declare module 'redux-thunk' {
  export interface ThunkDispatch<S, E, A extends Action> {
    <R>(thunk: ThunkAction<R, S, E, A>): R;
    <T extends A>(action: T): T;
  }

  export type ThunkAction<R, S, E, A extends Action> = (
    dispatch: ThunkDispatch<S, E, A>,
    getState: () => S,
    extraArgument: E
  ) => R;

  export type ThunkMiddleware<
    State = any,
    BasicAction extends Action = AnyAction,
    ExtraThunkArg = undefined
  > = Middleware<
    ThunkDispatch<State, ExtraThunkArg, BasicAction>,
    State,
    ThunkDispatch<State, ExtraThunkArg, BasicAction>
  >;

  export function createThunkMiddleware<
    State = any,
    BasicAction extends Action = AnyAction,
    ExtraThunkArg = undefined
  >(extraArgument?: ExtraThunkArg): ThunkMiddleware<State, BasicAction, ExtraThunkArg>;

  export const thunk: ThunkMiddleware & {
    withExtraArgument<
      State = any,
      BasicAction extends Action = AnyAction,
      ExtraThunkArg = undefined
    >(
      extraArgument?: ExtraThunkArg
    ): ThunkMiddleware<State, BasicAction, ExtraThunkArg>;
  };
}
