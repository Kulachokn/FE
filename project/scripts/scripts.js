'use strict';

class AssetRepository {

  constructor() {
    this.db = new PouchDB('assets');
    this.CONTENT_TYPES = {
      BOOK: 'BOOK',
      VIDEO: 'VIDEO',
      AUDIO: 'AUDIO'
    };

    if (this.db.search) {
      this.db.search({
        fields: ['title', 'description', 'tags'],
        build: true
      }).then(function (info) {
        console.log(info);
      }).catch(function (err) {
        console.error(err);
      });
    }

    this.db.createIndex({
      index: {
        fields: ['contentType']
      }
    }).then(function (info) {
      console.log(info);
    }).catch(function (err) {
      console.error(err);
    });
    this.db.createIndex({
      index: {
        fields: ['level']
      }
    }).then(function (info) {
      console.log(info);
    }).catch(function (err) {
      console.error(err);
    });
    this.db.createIndex({
      index: {
        fields: ['language']
      }
    }).then(function (info) {
      console.log(info);
    }).catch(function (err) {
      console.error(err);
    });
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

  update(asset) {
    return this.db.put(asset, {force: true});
  }

  async remove(id) {
    const response = await this.db.remove(id);
    console.log(response);
  }

  async search(request) {
    request.perPage = request.perPage || 10;
    request.page = request.page || 0;

    let reply;
    if (request.query) {
      reply = await this.db.search({
        query: request.query,
        fields: ['title', 'description', 'tags'],
        include_docs: true,
      });
      reply.rows = reply.rows.map(row => row.doc).filter((doc) => {
        if (request.types.length && !request.types.includes(doc.contentType)) return false;
        if (request.levels.length && !request.levels.includes(doc.level)) return false;
        if (request.languages.length && !request.languages.includes(doc.language)) return false;

        return true;
      });
      reply.total_rows = reply.rows.length;
      const left = request.page * request.perPage;
      const right = request.page * request.perPage + request.perPage;
      reply.rows = reply.rows.slice(left, right);
    } else {
      const query = {selector: {}};
      if (request.languages.length) {
        query.selector.language = {$in: request.languages};
      }
      if (request.types.length) {
        query.selector.contentType = {$in: request.types};
      }
      if (request.levels.length) {
        query.selector.level = {$in: request.levels};
      }

      if (request.sortBy) {
        query.sort = [{[request.sortBy]: request.sortDir || 'asc'}]
      }

      reply = await this.db.find(query);
      const totalCount = reply.docs.length;
      const left = request.page * request.perPage;
      const right = request.page * request.perPage + request.perPage;
      reply.docs = reply.docs.slice(left, right);

      reply = {
        total_rows: totalCount,
        rows: reply.docs
      }
    }
    reply.page = request.page;
    reply.perPage = request.perPage;

    console.log(reply);
    return reply;
  }
}

class AssetController {

  constructor() {
    this.assetRepository = new AssetRepository();
    this.addAsset = this.addAsset.bind(this);
    this.search = this.search.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.initialIndexPageRender = this.initialIndexPageRender.bind(this);
    this._renderSearchResultItem = this._renderSearchResultItem.bind(this);

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

  async search(event) {
    event.preventDefault();
    const searchParams = this._parseSearchForm();
    this._updateUrl(searchParams);
    const searchRequest = this._searchParamsToSearchRequest(searchParams);
    const searchResult = await this.assetRepository.search(searchRequest);
    this._renderSearchResult(searchResult);
  }

  async applyFilters(event) {
    event.preventDefault();
    const searchParams = this._parseFilterForm();
    this._updateUrl(searchParams);
    const searchRequest = this._searchParamsToSearchRequest(searchParams);
    const searchResult = await this.assetRepository.search(searchRequest);
    this._renderSearchResult(searchResult);
  }

  async initialIndexPageRender() {
    const searchParams = new URLSearchParams(location.search);
    this._syncSearchParamsWithPageFilters(searchParams);
    const searchRequest = this._searchParamsToSearchRequest(searchParams);
    const searchResult = await this.assetRepository.search(searchRequest);
    this._renderSearchResult(searchResult);
  }

  _syncSearchParamsWithPageFilters(searchParams) {
    ['type', 'level', 'lang']
      .forEach(queryParam => searchParams.getAll(queryParam)
        .forEach(value => {
          document.querySelector(`input[value=${value}]`).checked = true;
        })
      );
    document.getElementById('search').value = searchParams.get('query');
  }

  async showContent(user) {
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
      this._initializeRating(user, asset);

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

  async rateAsset(user, asset, score) {
    if (!user) return;

    const userPreviousScore = asset.rating.find(function (rating) {
      return rating.userId === user.id;
    });
    if (userPreviousScore) {
      userPreviousScore.score = score;
    } else {
      asset.rating.push({userId: user.id, score});
    }
    try {
      await this.assetRepository.update(asset);
    } catch (err) {
      console.error(err);
    }
  }

  _renderSearchResult(searchResult) {
    this._cleanList();
    this._renderAssetList(searchResult.rows);

    this._renderPagination(searchResult);
  }

  _renderAssetList(assets) {
    const assetList = document.querySelector('.items-list');
    assets.map(this._renderSearchResultItem).forEach(function (node) {
      assetList.appendChild(node);
    })
  }

  _cleanList() {
    const assetList = document.querySelector('.items-list');
    while (assetList.firstChild) {
      assetList.removeChild(assetList.firstChild);
    }
  }

  _renderSearchResultItem(asset) {
    const li = document.createElement('li');
    li.classList.add('stock-keeping-unit');
    const innerWrapper = document.createElement('div');
    innerWrapper.classList.add('stock-keeping-unit__inner');
    li.appendChild(innerWrapper);
    const thumbnail = document.createElement('img');
    thumbnail.alt = asset.title;
    thumbnail.width = 270;
    thumbnail.height = 214;
    thumbnail.classList.add('item-img');
    thumbnail.src = asset.thumbnail.url;
    innerWrapper.appendChild(thumbnail);

    const metadataContainer = document.createElement('div');
    innerWrapper.appendChild(metadataContainer);
    metadataContainer.classList.add('item-description');
    const showContentLink = document.createElement('a');
    showContentLink.href = `show-content.html?id=${asset._id}`;
    metadataContainer.appendChild(showContentLink);
    const title = document.createElement('h3');
    title.classList.add('item-title');
    title.innerText = asset.title;
    showContentLink.appendChild(title);
    const icon = this._renderContentTypeIcon(asset.contentType);
    metadataContainer.appendChild(icon);
    const author = document.createElement('p');
    metadataContainer.appendChild(author);
    author.textContent = `Автор: ${asset.createdBy.name}`;
    const language = document.createElement('p');
    metadataContainer.appendChild(language);
    language.textContent = `Язык: ${this.SUPPORTED_LANGUAGES[asset.language]}`;
    const level = document.createElement('p');
    metadataContainer.appendChild(level);
    level.textContent = `Уровень: ${asset.level}`;
    const createdAt = document.createElement('p');
    metadataContainer.appendChild(createdAt);
    createdAt.textContent = `Дата добавления: ${dateFns.format(asset.createdAt, 'DD/MM/YYYY')}`;

    const mask = document.createElement('div');
    innerWrapper.appendChild(mask);
    mask.classList.add('stock-keeping-unit__mask');
    const addToFavoriteLink = document.createElement('a');
    mask.appendChild(addToFavoriteLink);
    addToFavoriteLink.classList.add('add-to-favorites');
    addToFavoriteLink.classList.add('mask');
    addToFavoriteLink.textContent = 'Добавить в избранное';
    const showContentMaskLink = document.createElement('a');
    mask.appendChild(showContentMaskLink);
    showContentMaskLink.textContent = 'Открыть';
    showContentMaskLink.classList.add('show-content-button');
    showContentMaskLink.classList.add('button-decoration');
    showContentMaskLink.href = `show-content.html?id=${asset._id}`;

    return li;
  }

  _renderContentTypeIcon(type) {
    const contentType = document.createElement('p');
    const contentTypeIcon = document.createElement('i');
    contentType.appendChild(contentTypeIcon);
    contentTypeIcon.classList.add('fas');

    switch (type) {
      case this.assetRepository.CONTENT_TYPES.AUDIO:
        contentTypeIcon.classList.add('fa-headphones');
        break;
      case this.assetRepository.CONTENT_TYPES.VIDEO:
        contentTypeIcon.classList.add('fa-video');
        break;
      case this.assetRepository.CONTENT_TYPES.BOOK:
        contentTypeIcon.classList.add('fa-book');
        break;
    }

    return contentType;
  }

  _renderPagination(searchResult) {

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

  _initializeRating(user, asset) {
    const self = this;
    const contentType = asset.contentType.toLowerCase();
    const ratings = document.querySelectorAll(`.${contentType} .rating`);
    if (!user) {
      ratings.forEach(function (rating) {
        rating.classList.add('hidden');
      });
      return;
    }

    const userPreviousScore = this._getUserPreviousScore(user, asset);

    ratings.forEach(function (rating) {
      const ratingItem = rating.querySelectorAll('.rating-item');

      for (let i = 0; i < userPreviousScore; i++) {
        ratingItem[i].classList.add('active');
        if (i + 1 === userPreviousScore) {
          ratingItem[i].classList.add('current-active');
        }
      }

      rating.onclick = async function (event) {
        if (event.target.classList.contains('rating-item')) {
          const score = Number(event.target.getAttribute('data-rate'));
          await self.rateAsset(user, asset, score);
          removeClass(ratingItem, 'current-active');
          event.target.classList.add('active');
          event.target.classList.add('current-active');
        }
      };

      rating.onmouseover = function (event) {
        if (event.target.classList.contains('rating-item')) {
          removeClass(ratingItem, 'active');
          event.target.classList.add('active');
          mouseOverActiveClass(ratingItem)
        }
      };
      rating.onmouseout = function () {
        addClass(ratingItem, 'active');
        mouseOutActiveClass(ratingItem);
      };

      function removeClass(arr) {
        for (let i = 0, iLen = arr.length; i < iLen; i++) {
          for (let j = 1; j < arguments.length; j++) {
            ratingItem[i].classList.remove(arguments[j]);
          }
        }
      }

      function addClass(arr) {
        for (let i = 0, iLen = arr.length; i < iLen; i++) {
          for (let j = 1; j < arguments.length; j++) {
            ratingItem[i].classList.add(arguments[j]);
          }
        }
      }

      function mouseOverActiveClass(arr) {
        for (let i = 0, iLen = arr.length; i < iLen; i++) {
          if (arr[i].classList.contains('active')) {
            break;
          } else {
            arr[i].classList.add('active');
          }
        }
      }

      function mouseOutActiveClass(arr) {
        for (let i = arr.length - 1; i >= 1; i--) {
          if (arr[i].classList.contains('current-active')) {
            break;
          } else {
            arr[i].classList.remove('active');
          }
        }
      }
    });
  }

  _getUserPreviousScore(user, asset) {
    const previousScore = asset.rating.find(function (rating) {
      return user.id === rating.userId;
    });
    if (!previousScore) {
      return null;
    }

    return previousScore.score;
  }

  _updateUrl(urlParams) {
    const nextUrl = location.protocol + "//" + location.host + location.pathname + `?${urlParams}`;
    history.pushState({path: nextUrl}, '', nextUrl);
  }

  _collectFilterValues(selector) {
    const result = [];
    const checkboxesList = document.querySelectorAll(`.filter-form .${selector} input[type=checkbox]:checked`);
    for (const checkbox of checkboxesList) {
      result.push(checkbox.value);
    }

    return result;
  }

  _searchParamsToSearchRequest(searchParams) {
    const request = {};
    request.types = searchParams.getAll('type');
    request.levels = searchParams.getAll('level');
    request.languages = searchParams.getAll('lang');
    request.query = searchParams.get('query');
    request.page = searchParams.get('page');
    request.perPage = searchParams.get('perPage');
    request.sortBy = searchParams.get('sortBy');
    request.sortDir = searchParams.get('sortDir');

    return request;
  }

  _parseFilterForm() {
    const contentTypes = this._collectFilterValues('available-type');
    const languages = this._collectFilterValues('available-language');
    const levels = this._collectFilterValues('available-level');

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('type');
    searchParams.delete('lang');
    searchParams.delete('level');
    contentTypes.forEach(function (type) {
      searchParams.append('type', type);
    });
    languages.forEach(function (language) {
      searchParams.append('lang', language);
    });
    levels.forEach(function (level) {
      searchParams.append('level', level);
    });

    return searchParams;
  }

  _parseSearchForm() {
    const queryField = document.querySelector('.site-search .search-field');
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('query', queryField.value);
    return searchParams;
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
    const searchForm = document.querySelector('.site-search');
    const filterForm = document.querySelector('.filter-form');
    searchForm.onsubmit = assetController.search;
    filterForm.onsubmit = assetController.applyFilters;
    assetController.initialIndexPageRender();
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
    const user = userController.getCurrentUser();
    assetController.showContent(user);
  }

  function initializeAddContentPage() {
    if (!userController.isUserAuthenticated()) {
      document.location = 'index.html';
    }
    const addAssetForm = document.querySelector('.add-content-form');
    if (addAssetForm) {
      addAssetForm.onsubmit = assetController.addAsset;
    }
  }
}

initializePage();