import { AppDispatch, AppStore } from '@/libs/redux/store';
import store from '@/libs/redux/store';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';

type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = (): AppDispatch => useDispatch();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppStore = useStore.withTypes<AppStore>();
