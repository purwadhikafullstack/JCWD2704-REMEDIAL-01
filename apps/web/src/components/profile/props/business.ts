import { TUser } from '@/models/user.model';
import { FormikProps } from 'formik';

export interface BusinessValues {
  name: string;
  address: string;
  image: string | File | null;
  bank: string;
  bank_account: string;
  phone: string;
  email: string;
}

export interface ProfileProps {
  formik: FormikProps<BusinessValues>;
  imageSrc: string;
  setImageSrc: React.Dispatch<React.SetStateAction<string>>;
  userImg: string;
  initialServerValues: BusinessValues;
  user: TUser | null;
  setLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  defaultImageUrl: string;
  hasChanges: boolean;
}
