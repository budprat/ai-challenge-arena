declare module '@reduxjs/toolkit' {
  import { Reducer, Action, AnyAction, Middleware, Store, StoreEnhancer, compose } from 'redux';
  
  // ConfigureStore types
  export interface ConfigureStoreOptions<S = any, A extends Action = AnyAction> {
    reducer: Reducer<S, A> | ReducersMapObject<S, A>;
    middleware?: ((getDefaultMiddleware: GetDefaultMiddleware<S>) => Middleware<{}, S, ThunkDispatch<S, any, AnyAction>>[]) | Middleware<{}, S, ThunkDispatch<S, any, AnyAction>>[];
    devTools?: boolean | DevToolsOptions;
    preloadedState?: DeepPartial<S>;
    enhancers?: StoreEnhancer[] | ConfigureEnhancersCallback;
  }

  export type GetDefaultMiddleware<S = any> = (...args: any[]) => Middleware<{}, S, ThunkDispatch<S, any, AnyAction>>[];

  export interface ReducersMapObject<S = any, A extends Action = Action> {
    [key: string]: Reducer<S[keyof S], A>;
  }

  export interface DevToolsOptions {
    name?: string;
    latency?: number;
    maxAge?: number;
    trace?: boolean | (() => string);
    traceLimit?: number;
    serialize?: boolean | {
      options?: {
        date?: boolean;
        function?: boolean;
        regex?: boolean;
        undefined?: boolean;
        error?: boolean;
        symbol?: boolean;
        map?: boolean;
        set?: boolean;
      }
    };
    actionSanitizer?: (action: any) => any;
    stateSanitizer?: (state: any) => any;
    actionsBlacklist?: string | string[];
    actionsWhitelist?: string | string[];
    predicate?: (state: any, action: any) => boolean;
    shouldRecordChanges?: boolean;
    pauseActionType?: string;
    autoPause?: boolean;
    shouldStartLocked?: boolean;
    shouldHotReload?: boolean;
    shouldCatchErrors?: boolean;
    features?: {
      pause?: boolean;
      lock?: boolean;
      persist?: boolean;
      export?: boolean | 'custom';
      import?: boolean | 'custom';
      jump?: boolean;
      skip?: boolean;
      reorder?: boolean;
      dispatch?: boolean;
      test?: boolean;
    };
  }

  export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
  };

  export type ConfigureEnhancersCallback = (defaultEnhancers: StoreEnhancer[]) => StoreEnhancer[];

  export function configureStore<S = any, A extends Action = AnyAction>(options: ConfigureStoreOptions<S, A>): Store<S, A> & {
    dispatch: ThunkDispatch<S, any, A>;
  };

  // CreateSlice types
  export interface CreateSliceOptions<State = any, CR extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    name: Name;
    initialState: State | (() => State);
    reducers: ValidateSliceCaseReducers<State, CR>;
    extraReducers?: CaseReducers<State, any> | ((builder: ActionReducerMapBuilder<State>) => void);
  }

  export interface SliceCaseReducers<State> {
    [K: string]: CaseReducer<State, PayloadAction<any>> | CaseReducerWithPrepare<State, PayloadAction<any>>;
  }

  export type CaseReducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S | void;

  export interface CaseReducerWithPrepare<State, A extends PayloadAction> {
    reducer: CaseReducer<State, A>;
    prepare: (...args: any[]) => { payload: A['payload'] } & Pick<A, Exclude<keyof A, 'type' | 'payload'>>;
  }

  export type ValidateSliceCaseReducers<S, ACR extends SliceCaseReducers<S>> = ACR;

  export interface ActionReducerMapBuilder<State> {
    addCase<ActionCreator extends ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload>(
      actionCreator: ActionCreator,
      reducer: CaseReducer<State, ReturnType<ActionCreator>>
    ): ActionReducerMapBuilder<State>;
    addMatcher<A extends AnyAction>(
      matcher: (action: AnyAction) => action is A,
      reducer: CaseReducer<State, A>
    ): ActionReducerMapBuilder<State>;
    addDefaultCase(reducer: CaseReducer<State, AnyAction>): ActionReducerMapBuilder<State>;
  }

  export interface ActionCreatorWithPreparedPayload<Args extends any[], P> {
    (...args: Args): PayloadAction<P>;
    type: string;
  }

  export interface ActionCreatorWithoutPayload {
    (): AnyAction;
    type: string;
  }

  export interface PayloadAction<P = void, T extends string = string, M = never, E = never> extends Action<T> {
    payload: P;
    meta: M;
    error: E;
  }

  export function createSlice<State, CaseReducers extends SliceCaseReducers<State>, Name extends string = string>(
    options: CreateSliceOptions<State, CaseReducers, Name>
  ): Slice<State, CaseReducers, Name>;

  export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    name: Name;
    reducer: Reducer<State>;
    actions: CaseReducerActions<CaseReducers>;
    caseReducers: SliceCaseReducers<State>;
  }

  export type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
    [K in keyof CaseReducers]: CaseReducers[K] extends { prepare: any }
      ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[K]>
      : ActionCreatorForCaseReducer<CaseReducers[K]>;
  };

  export type ActionCreatorForCaseReducer<CR> = CR extends (state: any, action: infer Action) => any
    ? Action extends { payload: infer P }
      ? ActionCreatorWithPayload<P>
      : ActionCreatorWithoutPayload
    : ActionCreatorWithoutPayload;

  export type ActionCreatorForCaseReducerWithPrepare<CR extends { prepare: any }> = CR['prepare'] extends (...args: infer Args) => any
    ? ActionCreatorWithPreparedPayload<Args, ReturnType<CR['prepare']>['payload']>
    : never;

  export interface ActionCreatorWithPayload<P> {
    (payload: P): PayloadAction<P>;
    type: string;
  }

  // CreateAsyncThunk types
  export type AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig extends AsyncThunkConfig = {}> = (
    ...args: any[]
  ) => any;

  export interface AsyncThunkConfig {
    state?: unknown;
    dispatch?: Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
  }

  export function createAsyncThunk<Returned, ThunkArg = void, ThunkApiConfig extends AsyncThunkConfig = {}>(
    typePrefix: string,
    payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
    options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
  ): AsyncThunkActionCreator<Returned, ThunkArg, ThunkApiConfig>;

  export type AsyncThunkPayloadCreator<Returned, ThunkArg = void, ThunkApiConfig extends AsyncThunkConfig = {}> = (
    arg: ThunkArg,
    thunkAPI: GetThunkAPI<ThunkApiConfig>
  ) => Promise<Returned> | Returned;

  export type GetThunkAPI<ThunkApiConfig extends AsyncThunkConfig> = {
    dispatch: ThunkDispatch<ThunkApiConfig['state'], ThunkApiConfig['extra'], AnyAction>;
    getState: () => ThunkApiConfig['state'];
    extra: ThunkApiConfig['extra'];
    requestId: string;
    signal: AbortSignal;
    rejectWithValue: (value: ThunkApiConfig['rejectValue']) => RejectWithValue<ThunkApiConfig['rejectValue']>;
  };

  export interface RejectWithValue<RejectValue> {
    readonly payload: RejectValue;
    readonly type: 'RejectWithValue';
  }

  export interface AsyncThunkOptions<ThunkArg = void, ThunkApiConfig extends AsyncThunkConfig = {}> {
    condition?: (arg: ThunkArg, api: GetThunkAPI<ThunkApiConfig>) => boolean | Promise<boolean>;
    dispatchConditionRejection?: boolean;
  }

  export interface AsyncThunkActionCreator<Returned, ThunkArg, ThunkApiConfig extends AsyncThunkConfig = {}> {
    pending: ActionCreatorWithPreparedPayload<[string, ThunkArg?], undefined>;
    fulfilled: ActionCreatorWithPreparedPayload<[string, ThunkArg, Returned], Returned>;
    rejected: ActionCreatorWithPreparedPayload<
      [string, ThunkArg, (ThunkApiConfig['rejectValue'] | undefined)?, string?],
      ThunkApiConfig['rejectValue'] | undefined,
      ThunkApiConfig['serializedErrorType'] | undefined,
      boolean
    >;
    (arg: ThunkArg): AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig>;
    typePrefix: string;
  }

  // ThunkAction types
  export type ThunkAction<R, S, E, A extends Action> = (
    dispatch: ThunkDispatch<S, E, A>,
    getState: () => S,
    extraArgument: E
  ) => R;

  export type ThunkDispatch<S, E, A extends Action> = (action: A | ThunkAction<any, S, E, A>) => any;
}
