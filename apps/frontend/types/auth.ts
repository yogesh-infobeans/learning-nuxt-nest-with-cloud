export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
