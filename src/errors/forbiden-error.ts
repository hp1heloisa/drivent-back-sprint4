import { ApplicationError } from '@/protocols';

export function forbidenError(): ApplicationError {
  return {
    name: 'ForbidenError',
    message: 'Forbiden error!',
  };
}