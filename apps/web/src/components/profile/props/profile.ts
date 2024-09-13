import { TUser } from '@/models/user.model';
import { FormikProps } from 'formik';

interface ProfileValues {
  image: string | File | null;
  first_name: string;
  last_name: string;
  email: string;
  deleteImg: boolean;
}

export interface ProfileProps {
  formik: FormikProps<ProfileValues>;
  imageSrc: string;
  setImageSrc: React.Dispatch<React.SetStateAction<string>>;
  userImg: string;
  initialServerValues: ProfileValues;
  user: TUser | null;
  setLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  defaultImageUrl: string;
  hasChanges: boolean;
}

export const initialValues = {
  name: '',
  address: '',
  image: null as string | File | null,
  bank: '',
  bank_account: '',
  phone: '',
  email: '',
};

export interface Business {
  name: string;
  address: string;
  image: string | File | null;
  bank: string;
  bank_account: string;
  phone: string;
  email: string;
}
