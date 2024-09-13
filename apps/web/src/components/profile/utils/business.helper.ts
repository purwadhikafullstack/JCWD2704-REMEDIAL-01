import { FormikHelpers } from 'formik';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  formik: FormikHelpers<any>,
  setFileSelected: (value: boolean) => void,
  setImageSrc: (value: string) => void,
  imageRef: React.RefObject<HTMLInputElement>,
  logoImg: string,
  defaultImageUrl: string,
) => {
  const file = event.currentTarget.files?.[0];
  if (file) {
    setFileSelected(true);
    if (file.size > 1048576) {
      toast.error('File size exceeds 1MB. Please select a smaller file.');
      if (imageRef.current) {
        imageRef.current.value = '';
      }
      setFileSelected(false);
      setImageSrc(logoImg || defaultImageUrl);
      formik.setFieldValue('image', null);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue('image', file);
    }
  } else {
    setImageSrc(logoImg || defaultImageUrl);
    formik.setFieldValue('image', null);
    setFileSelected(false);
  }
};

export const handleDeleteImage = (
  formik: FormikHelpers<any>,
  setFileSelected: (value: boolean) => void,
  setImageSrc: (value: string) => void,
  imageRef: React.RefObject<HTMLInputElement>,
  logoImg: string,
) => {
  const resetFileInput = () => {
    if (imageRef.current) {
      imageRef.current.value = '';
    }
    setFileSelected(false);
  };
  setImageSrc(logoImg);
  formik.setFieldValue('image', logoImg);
  resetFileInput();
};

export const handlePlaceChanged = (
  autocomplete: google.maps.places.Autocomplete | null,
  formik: FormikHelpers<any>,
) => {
  const place = autocomplete?.getPlace();
  if (place && place.formatted_address) {
    formik.setFieldValue('address', place.formatted_address);
  }
};

export const handleNumber = (
  event: React.ChangeEvent<HTMLInputElement>,
  formik: FormikHelpers<any>,
) => {
  const numericValue = event.target.value.replace(/[^0-9]/g, '');
  const { id } = event.target;
  if (id === 'bank_account') {
    formik.setFieldValue('bank_account', numericValue);
  } else if (id === 'phone') {
    formik.setFieldValue('phone', numericValue);
  }
};

export const handleCancel = async (
  formik: FormikHelpers<any>,
  hasChanges: boolean,
  initialServerValues: any,
  setLoadingPage: (value: boolean) => void,
  setFileSelected: (value: boolean) => void,
  setImageSrc: (value: string) => void,
  imageRef: React.RefObject<HTMLInputElement>,
  logoImg: string,
) => {
  if (hasChanges) {
    const result = await Swal.fire({
      title: 'Unsaved changes!',
      text: 'Do you want to cancel without saving?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel!',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      setLoadingPage(true);
      try {
        await formik.setValues(initialServerValues);
        setImageSrc(logoImg);
        if (imageRef.current) {
          imageRef.current.value = '';
        }
        setFileSelected(false);
      } catch (error) {
        console.error('Error resetting form values:', error);
      } finally {
        setLoadingPage(false);
      }
    }
  }
};
