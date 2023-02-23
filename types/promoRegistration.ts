import { Promotion } from 'promotion';
import { Registration } from 'registration';

export interface PromoRegistration {
  promotion: Promotion;
  registration: Registration;
  successfullyPosted: boolean;
  error: string | undefined;
}
