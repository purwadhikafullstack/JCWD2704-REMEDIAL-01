export interface TUser {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  is_verified?: string;
  reqEmailChange?: string;
  user?: TUser;
  business?: { id: string; name: string };
}

export interface UserLoginPayload {
  email: string;
  password: string;
  user: TUser;
}
