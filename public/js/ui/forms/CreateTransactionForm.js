/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
class CreateTransactionForm extends AsyncForm {
  /**
   * Вызывает родительский конструктор и
   * метод renderAccountsList
   * */
  constructor(element) {
    super(element);
    this.renderAccountsList();
  }

  /**
   * Очищает выпадающий список в форме
   * */
  cleanAccountsList(selectElem) {
    const oldOptions = selectElem.querySelectorAll('option');
    if (oldOptions.length > 0) {
      oldOptions.forEach((item) => {
        item.remove();
      });
    }
  }

  /**
   * Формирует выпадающий список
   * на основе элемента select и полученных данных
   * */
  createOptionElement(selectElem, data) {
    data.forEach((item) => {
      const optionElem = document.createElement('option');
      optionElem.setAttribute('value', item.id);
      optionElem.textContent = item.name;
      selectElem.append(optionElem);
    });
  }

  /**
   * Получает список счетов с помощью Account.list
   * Обновляет в форме всплывающего окна выпадающий список
   * */
  renderAccountsList() {
    if (User.current()) {
      const user = User.current();
      const data = {
        mail: user.email,
        password: user.password,
      };
      Account.list(data, (err, response) => {
        if (response) {
          const select = this.element.querySelector('.accounts-select');
          this.cleanAccountsList(select);
          this.createOptionElement(select, response.data);
        } else {
          alert(err.error);
        }
      });
    }
  }

  /**
   * Создаёт новую транзакцию (доход или расход)
   * с помощью Transaction.create. По успешному результату
   * вызывает App.update(), сбрасывает форму и закрывает окно,
   * в котором находится форма
   * */
  onSubmit(data) {
    Transaction.create(data, (err, response) => {
      if (response) {
        App.update();
        this.element.reset();
        if (this.element.id === 'new-income-form') {
          App.getModal('newIncome').close();
        } else {
          App.getModal('newExpense').close();
        }
      }
    });
  }
  o;
}
