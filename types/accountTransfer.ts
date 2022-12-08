export interface AccountTransfer {
  account: string | null;
  amount: number;
  businessUnit: string;
  departmentId: string;
  description: string;
  error: string | null;
  expenseType: string;
  firstName: string;
  glAccount: string;
  id: string | null;
  lastName: string;
  operatingUnit: string;
  paymentId: string;
  productCode: string;
  projectId: string | null;
  registrationId: string;
  reportId: string | null;
}
