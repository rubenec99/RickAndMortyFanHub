export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  user_type: string;
  birth_date: string;
  isSelected?: boolean;
  originalUserType?: string;
}
