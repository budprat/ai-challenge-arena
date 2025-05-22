// Type definitions for Redux core
declare module 'redux' {
  // Basic types
  export interface Action<T = any> {
    type: T
  }

  export interface AnyAction extends Action {
    // Allows any extra properties to be defined in an action.
    [extraProps: string]: any
  }

  export interface Reducer<S = any, A extends Action = AnyAction> {
    (state: S | undefined, action: A): S
  }

  export interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: T): T
  }

  export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
    dispatch: D
    getState(): S
  }

  export interface Middleware<
    _DispatchExt = {}, // For backwards compatibility, allow the first type argument to be misconfigured.
    S = any,
    D extends Dispatch = Dispatch
  > {
    (api: MiddlewareAPI<D, S>): (
      next: D
    ) => (action: D extends Dispatch<infer A> ? A : never) => any
  }

  export interface StoreEnhancer<Ext = {}, StateExt = {}> {
    (next: StoreEnhancerStoreCreator<Ext, StateExt>): StoreEnhancerStoreCreator<Ext, StateExt>
  }

  export type StoreEnhancerStoreCreator<Ext = {}, StateExt = {}> = <
    S = any,
    A extends Action = AnyAction
  >(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>
  ) => Store<S & StateExt, A> & Ext

  export type PreloadedState<S> = Required<S> extends {
    [K in keyof S]: S[K] extends object
      ? S[K]
      : S[K] | undefined
  }
    ? { [K in keyof S]?: PreloadedState<S[K]> }
    : S

  export interface Store<S = any, A extends Action = AnyAction> {
    dispatch: Dispatch<A>
    getState(): S
    subscribe(listener: () => void): Unsubscribe
    replaceReducer<NewState, NewActions extends Action>(
      nextReducer: Reducer<NewState, NewActions>
    ): Store<NewState, NewActions>
  }

  export type Unsubscribe = () => void

  export function createStore<S, A extends Action, Ext = {}, StateExt = {}>(
    reducer: Reducer<S, A>,
    enhancer?: StoreEnhancer<Ext, StateExt>
  ): Store<S & StateExt, A> & Ext
  export function createStore<S, A extends Action, Ext = {}, StateExt = {}>(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>,
    enhancer?: StoreEnhancer<Ext, StateExt>
  ): Store<S & StateExt, A> & Ext

  export function applyMiddleware<Ext = {}, S = any>(
    ...middlewares: Middleware<any, S, any>[]
  ): StoreEnhancer<{ dispatch: Ext }, S>

  export function bindActionCreators<A, C extends ActionCreator<A>>(
    actionCreator: C,
    dispatch: Dispatch
  ): C
  export function bindActionCreators<
    A extends ActionCreator<any>,
    B extends ActionCreator<any>
  >(actionCreator: A, dispatch: Dispatch): B
  export function bindActionCreators<A, M extends ActionCreatorsMapObject<A>>(
    actionCreators: M,
    dispatch: Dispatch
  ): M
  export function bindActionCreators<
    M extends ActionCreatorsMapObject<any>,
    N extends ActionCreatorsMapObject<any>
  >(actionCreators: M, dispatch: Dispatch): N

  export function combineReducers<S>(
    reducers: ReducersMapObject<S, any>
  ): Reducer<CombinedState<S>>
  export function combineReducers<S>(
    reducers: ReducersMapObject<S, any>
  ): Reducer<CombinedState<S>, Action>
  export function combineReducers<S, A extends Action = AnyAction>(
    reducers: ReducersMapObject<S, A>
  ): Reducer<CombinedState<S>, A>

  export function compose<Funcs extends Function[]>(...funcs: Funcs): Funcs extends [(...args: any[]) => infer R]
    ? (...args: any[]) => R
    : Funcs extends [(...args: any[]) => infer R, ...infer Rest]
    ? Rest extends [(...args: any[]) => infer R2, ...infer Rest2]
      ? (...args: any[]) => Funcs extends [
          (...args: any[]) => infer R,
          (...args: R) => infer R2,
          ...infer Rest3
        ]
        ? Rest3 extends [(...args: any[]) => any]
          ? R2
          : never
        : never
      : (...args: any[]) => R
    : (...args: any[]) => any

  export type ActionCreator<A> = (...args: any[]) => A

  export interface ActionCreatorsMapObject<A = any> {
    [key: string]: ActionCreator<A>
  }

  export type CombinedState<S> = S extends { [K in keyof S]: infer U }
    ? { [K in keyof S]: U }
    : never

  export interface ReducersMapObject<S = any, A extends Action = Action> {
    [key: string]: Reducer<S[keyof S], A>
  }
}
