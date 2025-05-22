import { Action, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Add enhanced types for react-redux
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}

  // Enhanced useDispatch and useSelector hooks
  export function useDispatch<TDispatch = ThunkDispatch<RootState, any, Action>>(): TDispatch;
  export function useSelector<TState = RootState, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
}
