export type TUser = {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  is_verified?: string;
  reqEmailChange?: string;
  user?: TUser;
};

export interface UserLoginPayload {
  email: string;
  password: string;
  user: TUser;
}
