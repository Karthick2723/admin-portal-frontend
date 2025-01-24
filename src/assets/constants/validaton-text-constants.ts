export const InputValidationConstants = {
    inputTextMinLength: 1,
    inputTextMaxLength: 250,
    inputPhMinCount: 10,
    inputPhMaxCount: 10,
    inputBannerMinContent:1,
    inputBannerMaxContent:60,

    minLenBannerValidationText:`This field must have atleast 1 characters`,
    maxLenBannerValidationText:`This field must have atleast 50 characters`,
    minLenValidationText: `This field must have atleast 5 characters`,
    maxLenValidationText: `This field must have atmost 250 characters`,
  
    phNoMinValidationCount: `Phone Number is too short. Please enter at least 7 digits`,
    phNoMaxValidationCount: `Phone Number is too long. Please enter at most 15 digits`,
  
    emailValidationText: "Invalid email format",
  
    timeValidationText: "From time must be less than To time",

    formSubmissionFailedMsg:'Submission failed. Please try again.',
    formUpdationFailedMsg:'Updation failed. Please try again.',
  };
  export interface ClientDivisionFormState {
    isFormUpdate: boolean;
    clientId: number;
  }
  
  