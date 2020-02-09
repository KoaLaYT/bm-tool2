export class FormUtil {
  static async validateForms(forms) {
    const valid = await Promise.all(forms.map(formValidation)).catch(e => e);
    return Array.isArray(valid) ? -1 : valid;

    function formValidation(form, index) {
      return new Promise((resolve, reject) => {
        form.validate(async valid => {
          if (!valid) reject(index);
          else resolve(true);
        });
      });
    }
  }
}
