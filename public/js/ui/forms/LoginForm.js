/**
 * Класс LoginForm управляет формой
 * входа в портал
 * */
class LoginForm extends AsyncForm {
  /**
   * Производит авторизацию с помощью User.login
   * После успешной авторизации, сбрасывает форму,
   * устанавливает состояние App.setState( 'user-logged' ) и
   * закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.login(data, (err) => {
      if (err) {
        alert(`${err.error}`);
        App.getForm('login').element.reset();
        App.getModal('login').close();
      } else {
        App.setState('user-logged');
        App.getForm('login').element.reset();
        App.getModal('login').close();
      }
    });
  }
}
