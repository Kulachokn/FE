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
    const response = await this.db.post({
      title: asset.title,
      level: asset.level,
      language: asset.language,
      createdAt: Date.now(),
      tags: asset.tags,
      thumbnail: asset.thumbnail,
      description: asset.description,
      rating: [],
      contentType: asset.contentType,
      createdBy: asset.user,
      fileName: asset.content.name,
      _attachments: {
        content: {
          content_type: asset.content.type,
          data: asset.content
        }
      }
    });
    console.log(response);
    return response;
  }

  async getOne(id) {
    const asset = await this.db.get(id);
    asset.content = await this.db.getAttachment(id, 'content');
    console.log(asset);
    return asset;
  }

  async remove(id) {
    const response = await this.db.remove(id);
    console.log(response);
  }
}

// a909f676-c35c-4f61-b339-668167a54b18
class AssetController {

  constructor() {
    this.assetRepository = new AssetRepository();
    this.addAsset = this.addAsset.bind(this);

    this.SUPPORTED_LANGUAGES = {
      rus: 'Русский',
      eng: 'Ангельский'
    }
  }

  async addAsset(event) {
    event.preventDefault();
    const titleField = document.querySelector('.add-content-form input[name=title]');
    const descriptionField = document.querySelector('.add-content-form textarea[name=description]');
    const tagsField = document.querySelector('.add-content-form input[name=tags]');
    const contentField = document.querySelector('.add-content-form input[name=file]');
    const thumbnailField = document.querySelector('.add-content-form input[name=thumbnail]');
    const levelField = [].filter.call(document.querySelectorAll('.add-content-form input[name=level]'), function (node) {
      return node.checked
    })[0];
    const languageField = [].filter.call(document.querySelectorAll('.add-content-form input[name=language]'), function (node) {
      return node.checked
    })[0];

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
        url: await this._readThumbnail(thumbnail),
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
    const spinner = document.querySelector('.loading');
    const contentNotFound = document.querySelector('.content-not-found');
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const assetId = params.get('id');
    let asset;
    try {
      if (!assetId) {
        console.error(`Not found asset with id "${assetId}"`);
        contentNotFound.classList.remove('hidden');
        return;
      }
      asset = await this.assetRepository.getOne(assetId);

      this._renderContentMetadata(asset);
      switch (asset.contentType) {
        case this.assetRepository.CONTENT_TYPES.VIDEO:
          this._showVideoContent(asset);
          break;
        case this.assetRepository.CONTENT_TYPES.AUDIO:
          this._showAudioContent(asset);
          break;
        case this.assetRepository.CONTENT_TYPES.BOOK:
          this._showBookContent(asset);
          break;
      }

    } catch (err) {
      if (err.status === 404) {
        console.error(`Not found asset with id "${assetId}"`);
        contentNotFound.classList.remove('hidden');
        return;
      }
      console.error(err);
    } finally {
      spinner.classList.add('hidden');
      console.log(asset);
    }
  }

  _renderContentMetadata(asset) {
    const mediaType = asset.contentType.toLowerCase();

    const thumbnail = document.querySelector(`.${mediaType} picture img`);
    const title = document.querySelector(`.${mediaType} .show-content-title`);
    const description = document.querySelector(`.${mediaType} .show-content-description`);
    const language = document.querySelector(`.${mediaType} .show-content-language`);
    const createdAt = document.querySelector(`.${mediaType} .show-content-date`);
    const createdBy = document.querySelector(`.${mediaType} .show-content-author`);
    const tags = document.querySelector(`.${mediaType} .show-content-tags`);
    const level = document.querySelector(`.${mediaType} .show-content-level`);

    createdBy.textContent = asset.createdBy.name;
    tags.textContent = asset.tags || '-';
    level.textContent = asset.level;
    thumbnail.src = asset.thumbnail.url;
    title.textContent = asset.title;
    description.textContent = asset.description;
    language.textContent = this.SUPPORTED_LANGUAGES[asset.language];
    createdAt.textContent = dateFns.format(new Date(), 'DD/MM/YYYY HH:MM:SSS');
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
    switch (contentType) {
      case this.assetRepository.CONTENT_TYPES.BOOK:
        return 'img/default-book-thumbnail.jpg';
      case this.assetRepository.CONTENT_TYPES.AUDIO:
        return 'img/default-audio-thumbnail.jpg';
      case this.assetRepository.CONTENT_TYPES.VIDEO:
        return 'img/default-video-thumbnail.jpg';
      default:
        throw new Error(`Doesn't have thumbnail for provided content type "${contentType}"`);
    }
  }

  _readThumbnail(file) {
    return new Promise((ok, fail) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        ok(reader.result);
      };
      reader.onerror = fail;
      reader.readAsDataURL(file);
    });
  }

  _showVideoContent(asset) {
    return this._showMediaContent(asset, 'video', {preload: 'auto', controls: true, width: 1000, height: 900});
  }

  _showAudioContent(asset) {
    return this._showMediaContent(asset, 'audio', {controls: true});
  }

  _showMediaContent(asset, type, options) {
    const mediaSection = document.querySelector(`.${type}`);
    const media = document.createElement(type);

    Object.keys(options).forEach(function (option) {
      media[option] = options[option];
    });

    const source = document.createElement('source');
    source.src = URL.createObjectURL(asset.content);
    source.type = asset.content.type;
    media.appendChild(source);
    mediaSection.appendChild(media);
    mediaSection.classList.remove('hidden');
  }

  _showBookContent(asset) {
    if (asset.content.type.includes('epub')) {
      return this._renderEpubBook(asset);
    }
    if (asset.content.type.includes('pdf')) {
      return this._renderPdfBook(asset);
    }

    throw new Error(`Unsupported book type "${asset.content.type}"`);

  }

  _renderPdfBook(asset) {

  }

  _renderEpubBook(asset) {
    const book = ePub(asset.content);
    const rendition = book.renderTo("viewer", {
      manager: "continuous",
      flow: "paginated",
      width: "100%",
      height: 600
    });

    rendition.display();

    book.ready.then(() => {
      const next = document.getElementById("next");
      next.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
        e.preventDefault();
      }, false);
      const prev = document.getElementById("prev");
      prev.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
        e.preventDefault();
      }, false);

      const bookSection = document.querySelector('.book');
      bookSection.classList.remove('hidden');
    });
    rendition.on("layout", function (layout) {
      let viewer = document.getElementById("viewer");

      if (layout.spread) {
        viewer.classList.remove('single');
      } else {
        viewer.classList.add('single');
      }
    });

    book.loaded.navigation.then(function (toc) {
      const $select = document.getElementById("toc"),
        docfrag = document.createDocumentFragment();

      toc.forEach(function (chapter) {
        const option = document.createElement("option");
        option.textContent = chapter.label;
        option.ref = chapter.href;

        docfrag.appendChild(option);
      });

      $select.appendChild(docfrag);

      $select.onchange = function () {
        const index = $select.selectedIndex,
          url = $select.options[index].ref;
        rendition.display(url);
        return false;
      };

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
    assetController.showContent()
  }

  function initializeAddContentPage() {
    const addAssetForm = document.querySelector('.add-content-form');
    if (addAssetForm) {
      addAssetForm.onsubmit = assetController.addAsset;
    }
  }
}

initializePage();