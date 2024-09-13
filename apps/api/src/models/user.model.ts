export type TUser = {
  id: string;
  email: string;
  password?: string | null;
  first_name: string | null;
  last_name: string | null;
  is_verified: boolean | null;
  reqEmailChange: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TDecode = {
  type: string;
  user: TUser;
};
