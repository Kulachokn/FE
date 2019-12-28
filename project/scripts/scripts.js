'use strict';

class UserRepository {
  constructor() {
    this.db = new PouchDB('users');
  }

  async create(email, password, name) {
    const response = await this.db.post({
      name: name,
      password: btoa(password),
      email: email,
      createdAt: dateFns.format(new Date(), 'DD-MM-YYYY HH:MM:SSS'),
    });
    console.log(response);
    return response;
  }

  async getOne(email) {
    const response = (await this.db.find({
      selector: {
        email
      }
    })).docs[0];
    console.log(response);
    return response;
  }
}

class UserControl {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async singUp(event) {
    event.preventDefault();
    const nameField = document.querySelector('.registration-form input[name=fullname]');
    const name = nameField.value;
    const emailField = document.querySelector('.registration-form input[name=email]');
    const email = emailField.value;
    const passwordField = document.querySelector('.registration-form input[name=password]');
    const password = passwordField.value;
    const passwordConfirmationField = document.querySelector('.registration-form input[name=confirmation-password]');
    const passwordConfirmation = passwordConfirmationField.value;


    if (password !== passwordConfirmation) {
      console.error('password mismatched!');
      return;
    }

    const response = await this.userRepository.create(email, password, name);

    nameField.value = '';
    emailField.value = '';
    passwordField.value = '';
    passwordConfirmationField.value = '';

    localStorage.setItem('user', JSON.stringify({name, email, id: response.id}));
  }
}