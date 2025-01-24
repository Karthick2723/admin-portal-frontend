import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function imageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const file = control.value;
        if (file) {
            const fileSizeInMB = file.size / (1024 * 1024);
            const fileType = file.type;

            if (fileSizeInMB > 5) {
                return { fileSize: true };
            }

            if (!fileType.startsWith('image/')) {
                return { fileType: true };
            }
        }
        return null;
    };
}


export function noLeadingTrailingWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const isWhitespace = (control.value || '').trim().length !== (control.value || '').length;
        const isValid = !isWhitespace;
        return isValid ? null : { 'leadingTrailingWhitespace': true };
    };
}


export function sizeFormatValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (!value) return null;

        // Regex for matching either 200×200 or 200*200
        const validFormat = /^(?:\d+×\d+|\d+\*\d+)$/;
        const isValid = validFormat.test(value);

        return isValid ? null : { 'sizeFormat': { value } };
    };


}


export function timeFormatValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
      const isValidTimeFormat = timePattern.test(control.value);
  
      // Check if time is '00:00:00'
      const isZeroTime = control.value === '00:00:00';
  
      if (control.value && (!isValidTimeFormat || isZeroTime)) {
        return { 'invalidTimeFormat': true };
      }
      return null;
    };
  }