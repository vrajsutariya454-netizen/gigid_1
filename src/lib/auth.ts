export const USER = {
  email: "demo@gigid.com",
  password: "1234",
};

export const login = (email: string, password: string) => {
  if (email === USER.email && password === USER.password) {
    localStorage.setItem("user", JSON.stringify(USER));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};