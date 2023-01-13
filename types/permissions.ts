export interface Permissions {
  id: string;
  conferenceId: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  reasonForRequest: string | null;
  givenByUserId: string | null;
  permissionLevel:
    | 'CREATOR'
    | 'FULL'
    | 'UPDATE'
    | 'CHECK_IN'
    | 'SCHOLARSHIP'
    | 'VIEW';
  timestamp: string | null;
  ministryId: string | null;
  strategyId: string | null;
  superAdmin: boolean | null;
  cruAdmin: boolean | null;
}
