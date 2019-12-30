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

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
    this.signUp = this.signUp.bind(this);
    this.logOut = this.logOut.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  async signUp(event) {
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

    localStorage.setItem('user', JSON.stringify({
      name: response.name,
      email: response.email,
      id: response.id
    }));
    document.location = 'index.html';
  }

  logOut() {
    localStorage.removeItem('user');
    this.readCurrentUser();
  }


  readCurrentUser() {
    const user = localStorage.getItem('user');
    const signInButton = document.querySelector('.sign-in-button');
    const userProfileBlock = document.querySelector('.user-profile-menu');
    if (!user) {
      signInButton.classList.remove('hidden');
      userProfileBlock.classList.add('hidden');
    } else {
      signInButton.classList.add('hidden');
      userProfileBlock.classList.remove('hidden');
    }
  }

  async logIn(event) {
    event.preventDefault();
    const emailField = document.querySelector('.registration-form input[name=email]');
    const email = emailField.value;
    const passwordField = document.querySelector('.registration-form input[name=password]');
    const password = passwordField.value;
    const emailErrorBlock = document.querySelector('.registration-form input[name=email]~.registration-error');
    emailField.classList.remove('error');
    emailErrorBlock.textContent = '';
    const passwordErrorBlock = document.querySelector('.registration-form input[name=password]~.registration-error');
    passwordField.classList.remove('error');
    passwordErrorBlock.textContent = '';

    const response = await this.userRepository.getOne(email);



    if (!response) {
      emailField.classList.add('error');
      emailErrorBlock.textContent = 'Неверный email';
      return;
    }

    if (btoa(password) !== response.password) {
      passwordField.classList.add('error');
      passwordErrorBlock.textContent = 'Неверный пароль';
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      name: response.name,
      email: response.email,
      id: response.id
    }));

    emailField.value = '';
    passwordField.value = '';

    document.location = 'index.html';
  }
}

const userController = new UserController();

userController.readCurrentUser();

const registrationForm = document.querySelector('.sign-up .registration-form');

if (registrationForm) {
  const registrationButton = document.querySelector('.registration-button');
  registrationButton.onclick = userController.signUp;
}

const logoutButton = document.querySelector('.user-logout');
logoutButton.onclick = userController.logOut;

const logInForm = document.querySelector('.sign-in .registration-form');
if (logInForm) {
  logInForm.onsubmit = userController.logIn;
}