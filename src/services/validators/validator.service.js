class validatorService {
  static validatorDistrictNumber = (value) => {
    if (value > 99999 && value < 1000000) {
      return true;
    } else {
      return false;
    }
  };

  static validatorNoDigits = (value) => {
    if (/^\d+$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  static validate2Digits = (value) => {
    if (/^\d+(?:\.\d{1,2})?$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };
}

export default validatorService;
