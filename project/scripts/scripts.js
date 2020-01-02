'use strict';

class AssetRepository {

  constructor() {
    this.db = new PouchDB('assets');
    this.CONTENT_TYPES = {
      BOOK: 'BOOK',
      VIDEO: 'VIDEO',
      AUDIO: 'AUDIO'
    }
  }

  async create(asset) {
    console.log(asset);

    const draftAsset = {
      title: asset.title,
      level: asset.level,
      language: asset.language,
      createdAt: Date.now(),
      tags: asset.tags,
      description: asset.description,
      rating: [],
      contentType: asset.contentType,
      createdBy: asset.user,
      _attachments: {
        [asset.content.name]: {
          content_type: asset.content.type,
          data: asset.content
        }
      }
    };

    if (asset.thumbnail.isDefault) {
      draftAsset.thumbnail = asset.thumbnail.url;
    } else {
      draftAsset._attachments.thumbnail = {
        data: asset.thumbnail.url,
        content_type: asset.thumbnail.contentType
      }
    }

    const response = await this.db.post(draftAsset);
    console.log(response);
    return response;
  }

  async getOne(id) {
    const response = await this.db.getAttachment(id, 'План_тренувань_CF_Banda.pdf');
    console.log(response);
    return response;
  }
}

class AssetController {

  constructor() {
    this.assetRepository = new AssetRepository();
    this.addAsset = this.addAsset.bind(this);
  }

  async addAsset(event) {
    event.preventDefault();
    const titleField = document.querySelector('.add-content-form input[name=title]');
    const descriptionField = document.querySelector('.add-content-form textarea[name=description]');
    const tagsField = document.querySelector('.add-content-form input[name=tags]');
    const contentField = document.querySelector('.add-content-form input[name=file]');
    const thumbnailField = document.querySelector('.add-content-form input[name=thumbnail]');
    const levelField = [].filter.call(document.querySelectorAll('.add-content-form input[name=level]'), function (node) { return node.checked })[0];
    const languageField = [].filter.call(document.querySelectorAll('.add-content-form input[name=language]'), function (node) { return node.checked })[0];

    const title = titleField.value;
    const description = descriptionField.value;
    const tags = tagsField.value;
    const content = contentField.files[0];
    let thumbnail = thumbnailField.files[0];
    const level = levelField.value;
    const language = languageField.value;
    const user = JSON.parse(localStorage.getItem('user'));
    const contentType = this._identifyContentType(content);

    if (title.length < 3) {
      console.error('Title should be at least 3 chars length!');
      return;
    }

    if (!content) {
      console.error('Content is required!');
      return;
    }

    if (!thumbnail) {
      thumbnail = {
        url: this._chooseDefaultThumbnail(contentType),
        isDefault: true,
      };
    } else {
      thumbnail = {
        url: this._readThumbnail(thumbnail),
        contentType: thumbnail.type,
        isDefault: false
      };
    }

    await this.assetRepository.create({
      title,
      description,
      tags,
      content,
      thumbnail,
      level,
      language,
      user,
      contentType
    });

  }

  async showContent() {
    const response = await this.assetRepository.getOne('d3184b00-64bf-4bdf-8dc8-0253fbbc0ef3');
    const url = window.URL.createObjectURL(response);
    const iframe = document.createElement('iframe');
    iframe.width = 600;
    iframe.height = 800;
    iframe.src = url;
    document.body.appendChild(iframe);
  }

  _identifyContentType(content) {
    if (content.type.includes('application')) {
      return this.assetRepository.CONTENT_TYPES.BOOK;
    }
    if (content.type.includes('video')) {
      return this.assetRepository.CONTENT_TYPES.VIDEO;
    }
    if (content.type.includes('audio')) {
      return this.assetRepository.CONTENT_TYPES.AUDIO;
    }

    throw new Error('Unsupported content type');
  }

  _chooseDefaultThumbnail(contentType) {
    switch(contentType) {
      case this.assetRepository.CONTENT_TYPES.BOOK:
        return '/img/default-book-thumbnail.jpg';
      case this.assetRepository.CONTENT_TYPES.AUDIO:
        return '/img/default-audio-thumbnail.jpg';
      case this.assetRepository.CONTENT_TYPES.VIDEO:
        return '/img/default-video-thumbnail.jpg';
      default:
        throw new Error(`Doesn't have thumbnail for provided content type "${contentType}"`);
    }
  }

  _readThumbnail(file) {
    return new Promise((ok, fail) => {
      const reader = new FileReader();
      reader.onloadend = function() {
        ok(reader.result);
      };
      reader.onerror = fail;
      reader.readAsDataURL(file);
    });
  }
}

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
      id: response._id
    }));

    emailField.value = '';
    passwordField.value = '';

    document.location = 'index.html';
  }
}


function initializePage() {
  const page = window.location.pathname;
  const userController = new UserController();
  const assetController = new AssetController();

  userController.readCurrentUser();

  const logoutButton = document.querySelector('.user-logout');
  logoutButton.onclick = userController.logOut;

  if (page.includes('index.html')) {
    return initializeIndexPage();
  }

  if (page.includes('sign-in.html')) {
    return initializeSignInPage();
  }

  if (page.includes('sign-up.html')) {
    return initializeSignUpPage();
  }

  if (page.includes('show-content.html')) {
    return initializeShowContentPage();
  }

  if (page.includes('add-content.html')) {
    return initializeAddContentPage();
  }

  function initializeIndexPage() {
    return undefined;
  }

  function initializeSignInPage() {
    const logInForm = document.querySelector('.sign-in .registration-form');
    if (logInForm) {
      logInForm.onsubmit = userController.logIn;
    }
  }

  function initializeSignUpPage() {
    const registrationForm = document.querySelector('.sign-up .registration-form');

    if (registrationForm) {
      const registrationButton = document.querySelector('.registration-button');
      registrationButton.onclick = userController.signUp;
    }
  }

  function initializeShowContentPage() {
    return undefined;
  }

  function initializeAddContentPage() {
    const addAssetForm = document.querySelector('.add-content-form');
    if (addAssetForm) {
      addAssetForm.onsubmit = assetController.addAsset;
    }
  }
}

initializePage();