/** Local type until IConfigFeature is added to @auto/shared (Task 6) */
export interface IConfigFeature {
  ID: string;
  code: string;
  name: string;
  requiresAuth: boolean;
  requiredRole_code: string | null;
  isActive: boolean;
}
