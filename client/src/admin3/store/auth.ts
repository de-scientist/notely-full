export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  // ✅ Add this field
  isAdmin?: boolean; // optional if some users may not have it
}
