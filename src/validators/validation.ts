const defaultErrorMessages = {
  invalidMinLength: 'Value is to short',
  invalidMaxLength: 'Value is to long',
  invalidEmail: 'Invalid email',
  invalidRequired: 'Value is missing',
  invalidPositive: 'Value is negative',
  invalidNumber: 'Value is not a number',
  invalidRegexp: 'Value is not valid',
}

export default class Validation<T> {
  value: T;
  isValid: boolean;
  error: string | null;
  // isDirty?: boolean;

  constructor(value: T) {
    this.value = value;
    this.isValid = true;
    this.error = '';
  }

  customCheck(customValidator: () => boolean, errorMessage = '') {
    if (!this.isValid) return this;

    this.isValid = customValidator();
    this.error = !this.isValid ? errorMessage : '';
    // this.isDirty = true;

    return this;
  }

  checkOnRegexp(errorMessage = '', regexpPattern: string | RegExp) {
    if (!this.isValid) return this;
    const regexp = new RegExp(regexpPattern);
    this.isValid = regexp.test(String(this.value));
    this.error = !this.isValid ? errorMessage || defaultErrorMessages.invalidRegexp : '';
    // this.isDirty = true;

    return this;
  }

  isEmail(errorMessage = '') {
    if (!this.isValid) return this;
    const emailRegex = new RegExp('^[^\\s<>"\\\\;:]+@[a-zA-Z0-9.\\-_]+\\.[a-zA-Z0-9-_]+$');
    return this.checkOnRegexp(errorMessage || defaultErrorMessages.invalidEmail, emailRegex);
  }

  isRequired(errorMessage = '') {
    if (!this.isValid) return this;

    this.isValid = !!this.value;
    this.error = !this.isValid ? errorMessage || defaultErrorMessages.invalidRequired : '';
    // this.isDirty = true;

    return this;
  }

  hasMinLength(minLength: number, errorMessage = '') {
    if (!this.isValid) return this;

    this.isValid = String(this.value).length >= minLength;
    this.error = !this.isValid ? errorMessage || defaultErrorMessages.invalidMinLength : '';

    return this;
  }

  hasMaxLength(maxLength: number, errorMessage = '') {
    if (!this.isValid) return this;

    this.isValid = String(this.value).length <= maxLength;
    this.error = !this.isValid ? errorMessage || defaultErrorMessages.invalidMaxLength : '';
    // this.isDirty = true;

    return this;
  }
}
