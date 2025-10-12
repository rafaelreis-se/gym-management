import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Brazilian CPF (Cadastro de Pessoas Físicas) validator
 */
@ValidatorConstraint({ name: 'isValidCPF', async: false })
export class IsValidCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    if (!cpf) return false;

    // Remove non-numeric characters
    cpf = cpf.replace(/[^\d]/g, '');

    // Check if it has 11 digits
    if (cpf.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  defaultMessage(): string {
    return 'Invalid CPF';
  }
}

export function IsValidCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCPFConstraint,
    });
  };
}

