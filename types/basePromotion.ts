export interface BasePromotion {
  id: string;
  code: string;
  description: string | null;
  businessUnit: string | null;
  departmentId: string | null;
  operatingUnit: string | null;
  projectId: string | null;
  name: string | null;
  activationDate: string;
  deactivationDate: string | null;
  createdDate: string | null;
  lastUpdateDate: string | null;
  amount: number;
  applyToAllRegistrants: boolean;
  numberLimit: number | null;
}
