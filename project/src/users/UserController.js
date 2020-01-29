import UserRepository from './UserRepository';

export default class UserController {
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
        const nameErrorBlock = document.querySelector('.registration-form input[name=fullname]~.registration-error');
        nameField.classList.remove('error');
        nameErrorBlock.textContent = '';
        const emailField = document.querySelector('.registration-form input[name=email]');
        const email = emailField.value;
        const emailErrorBlock = document.querySelector('.registration-form input[name=email]~.registration-error');
        emailField.classList.remove('error');
        emailErrorBlock.textContent = '';
        const passwordField = document.querySelector('.registration-form input[name=password]');
        const password = passwordField.value;
        const passwordErrorBlock = document.querySelector('.registration-form input[name=password]~.registration-error');
        passwordField.classList.remove('error');
        passwordErrorBlock.textContent = '';
        const passwordConfirmationField = document.querySelector('.registration-form input[name=confirmation-password]');
        const passwordConfirmation = passwordConfirmationField.value;
        const passwordConfirmationErrorBlock = document.querySelector('.registration-form input[name=confirmation-password]~.registration-error');
        passwordConfirmationField.classList.remove('error');
        passwordConfirmationErrorBlock.textContent = '';


        let hasError = false;

        if (name.length < 3) {
            nameField.classList.add('error');
            nameErrorBlock.textContent = 'Имя должно содержать более 3-х символов';
            hasError = true;
        }

        if (password !== passwordConfirmation) {
            passwordConfirmationField.classList.add('error');
            passwordConfirmationErrorBlock.textContent = 'Пароли не совпадают';
            hasError = true;
        }

        if (password.length < 3) {
            passwordField.classList.add('error');
            passwordErrorBlock.textContent = 'Пароль должен содержать более 2-х символов';
            hasError = true;
        }

        const userWithSameEmail = await this.userRepository.getOne(email);

        if (userWithSameEmail) {
            emailField.classList.add('error');
            emailErrorBlock.textContent = 'Email уже используется';
            hasError = true;
        }

        if (hasError) {
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
            id: response._id
        }));
        document.location = 'index.html';
    }

    logOut() {
        localStorage.removeItem('user');
        this.readCurrentUser();
        document.location = 'index.html';
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

    isUserAuthenticated() {
        return !!localStorage.getItem('user');
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        if (!user) return null;

        return JSON.parse(user);
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
            id: response._id
        }));

        emailField.value = '';
        passwordField.value = '';

        document.location = 'index.html';
    }
}