function formVaildation(form)
{
    const validation = form.checkValidity();
    form.classList.add('was-validated');

    return validation;
}