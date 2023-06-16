/**
 * Класс RegisterForm управляет формой
 * регистрации
 * */
class RegisterForm extends AsyncForm {
  /**
   * Производит регистрацию с помощью User.register
   * После успешной регистрации устанавливает
   * состояние App.setState( 'user-logged' )
   * и закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.register(data, (err) => {
      if (err) {
        alert(`${err.error}`);
        App.getForm('register').element.reset();
        App.getModal('register').close();
      } else {
        App.setState('user-logged');
        App.getForm('register').element.reset();
        App.getModal('register').close();
      }
    });
  }
}
