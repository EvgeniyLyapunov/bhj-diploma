/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error();
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render(this.lastOptions);
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    this.element.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('remove-account') ||
        e.target.parentElement.classList.contains('remove-account')
      ) {
        this.removeAccount(this.lastOptions);
      } else if (e.target.classList.contains('transaction__remove')) {
        this.removeTransaction(e.target.dataset.id);
      } else if (
        e.target.parentElement.classList.contains('transaction__remove')
      ) {
        this.removeTransaction(e.target.parentElement.dataset.id);
      }
    });
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount(id) {
    if (!this.lastOptions) {
      return;
    }
    const confirmation = confirm('Удалить этот счёт?');
    if (confirmation) {
      Account.remove({ id: id.account_id }, (err, response) => {
        if (response) {
          this.clear();
          App.updateWidgets();
          App.updateForms();
        } else {
          alert(err.error);
        }
      });
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    const isConfirmRemove = confirm(
      'Вы действительно хотите удалить эту транзакцию?'
    );
    if (isConfirmRemove) {
      Transaction.remove({ id }, (err, response) => {
        if (response) {
          this.update();
        } else {
          alert(err.error);
        }
      });
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    if (!options) {
      return;
    }

    this.lastOptions = options;

    Account.get(options.account_id, (err, response) => {
      if (response) {
        const accountTitle = response.data.filter(
          (item) => item.id === options.account_id
        )[0].name;
        this.renderTitle(accountTitle);
      } else {
        alert(err.error);
      }
      Transaction.list(options, (err, response) => {
        if (response) {
          this.renderTransactions(response.data);
        } else {
          alert(err.error);
        }
      });
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счёта');
    this.lastOptions = undefined;
  }

  /**
   * Метод очищает список транзакций
   * */
  refresh() {
    const oldElems = document.querySelectorAll('.transaction');
    oldElems.forEach((item) => {
      item.remove();
    });
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    const titleElem = this.element.querySelector('.content-title');
    titleElem.textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const startDate = new Date(date);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formatDate = startDate.toLocaleString('ru', options).toString();
    const formatTime = startDate
      .toLocaleTimeString()
      .slice(0, startDate.toLocaleTimeString().length - 3);

    return `${formatDate} в ${formatTime}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    const transaction = document.createElement('div');
    const typeClass =
      item.type === 'expense' ? 'transaction_expense' : 'transaction_income';
    transaction.classList.add('transaction', `${typeClass}`, 'row');
    transaction.innerHTML = `
      <div class="col-md-7 transaction__details">
        <div class="transaction__icon">
            <span class="fa fa-money fa-2x"></span>
        </div>
        <div class="transaction__info">
            <h4 class="transaction__title">${item.name}</h4>
            <div class="transaction__date">${this.formatDate(
              item.created_at
            )}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="transaction__summ">
            ${item.sum} <span class="currency">₽</span>
        </div>
      </div>
      <div class="col-md-2 transaction__controls">
        <button class="btn btn-danger transaction__remove" data-id=${item.id}>
            <i class="fa fa-trash"></i>  
        </button>
      </div>
    `;

    return transaction;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    this.refresh();
    const transactionsBlock = this.element.querySelector('.content');
    data.forEach((item) => {
      transactionsBlock.insertAdjacentElement(
        'afterbegin',
        this.getTransactionHTML(item)
      );
    });
  }
}
