import { format } from 'date-fns';
import ePub from 'epubjs/dist/epub.legacy.min';
import AssetRepository from './AssetRepository';
import AssetRequest from './AssetRequest';

export default class AssetController {

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
        this._syncSort();
        const searchRequest = new AssetRequest(searchParams);
        const searchResult = await this.assetRepository.search(searchRequest);
        this._renderSearchResult(searchResult);
    }

    async applyFilters(event) {
        event.preventDefault();
        const searchParams = this._parseFilterForm();
        this._updateUrl(searchParams);
        this._syncSort();
        const searchRequest = new AssetRequest(searchParams);
        const searchResult = await this.assetRepository.search(searchRequest);
        this._renderSearchResult(searchResult);
    }

    async initialIndexPageRender() {
        const searchParams = new URLSearchParams(location.search);
        this._syncSearchParamsWithPageFilters(searchParams);
        this._syncSort();
        const searchRequest = new AssetRequest(searchParams);
        const searchResult = await this.assetRepository.search(searchRequest);
        this._renderSearchResult(searchResult);
    }

    async showContent(user) {
        const spinner = document.querySelector('.loading');
        const contentNotFound = document.querySelector('.content-not-found');
        const params = new URLSearchParams(location.search);
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

    _syncSearchParamsWithPageFilters(searchParams) {
        ['type', 'level', 'lang']
            .forEach(queryParam => searchParams.getAll(queryParam)
                .forEach(value => {
                    document.querySelector(`input[value=${value}]`).checked = true;
                })
            );
        document.getElementById('search').value = searchParams.get('query');
    }

    _renderSearchResult(searchResult) {
        this._cleanList();
        this._renderAssetList(searchResult.rows);

        this._renderPagination(searchResult);
    }

    _renderAssetList(assets) {
        const assetList = document.querySelector('.items-list');
        const assetsNotFound = document.querySelector('.content-not-found');
        if (!assets.length) {
            assetList.classList.add('hidden');
            assetsNotFound.classList.remove('hidden');
        }
        assets.map(this._renderSearchResultItem).forEach(node => {
            assetList.appendChild(node);
        });
    }

    _cleanList() {
        const assetList = document.querySelector('.items-list');
        const assetsNotFound = document.querySelector('.content-not-found');
        assetsNotFound.classList.add('hidden');
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
        thumbnail.src = asset.thumbnail && asset.thumbnail.url;
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
        author.textContent = `Автор: ${asset.createdBy && asset.createdBy.name}`;
        const language = document.createElement('p');
        metadataContainer.appendChild(language);
        language.textContent = `Язык: ${this.SUPPORTED_LANGUAGES[asset.language]}`;
        const level = document.createElement('p');
        metadataContainer.appendChild(level);
        level.textContent = `Уровень: ${asset.level}`;
        const createdAt = document.createElement('p');
        metadataContainer.appendChild(createdAt);
        createdAt.textContent = `Дата добавления: ${format(asset.createdAt, 'dd/MM/yyyy')}`;

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
        const showRatingOfLikes = document.createElement('p');
        mask.appendChild(showRatingOfLikes);
        showRatingOfLikes.classList.add('assessment');
        const likeIcon = document.createElement('i');
        showRatingOfLikes.appendChild(likeIcon);
        likeIcon.classList.add('far');
        likeIcon.classList.add('fa-thumbs-up');
        const likesRating = document.createElement('span');
        showRatingOfLikes.appendChild(likesRating);
        likesRating.textContent = '4.8';

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
        const searchParams = new URLSearchParams(location.search);
        const prevButton = document.querySelector('.pagination-page-prev');
        const nextButton = document.querySelector('.pagination-page-next');
        const pagination = this._paginate(searchResult.total_rows, searchResult.page, searchResult.perPage);
        if (pagination.currentPage === 1) {
            prevButton.classList.add('disabled');
        } else {
            searchParams.set('page', pagination.currentPage - 1);
            prevButton.href = `index.html?${searchParams.toString()}`;
            prevButton.classList.remove('disabled');
        }

        if (pagination.currentPage === pagination.totalPages) {
            nextButton.classList.add('disabled');
        } else {
            searchParams.set('page', pagination.currentPage + 1);
            nextButton.href = `index.html?${searchParams.toString()}`;
            nextButton.classList.remove('disabled');
        }

        const container = document.querySelector('.pagination');
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(prevButton.parentNode);

        pagination.pages.forEach(page => {
            const box = document.createElement('li');
            container.appendChild(box);
            const link = document.createElement('a');
            box.appendChild(link);
            link.classList.add('pagination-number-page');
            link.innerText = page;
            searchParams.set('page', page);
            link.href = `index.html?${searchParams.toString()}`;
            if (page === pagination.currentPage) {
                link.classList.add('selected');
            }
        });
        container.appendChild(nextButton.parentNode);
    }

    _paginate(
        totalItems,
        currentPage,
        pageSize
    ) {
        // https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript
        const maxPages = 3;
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage, endPage;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }


    _renderContentMetadata(asset) {
        const mediaType = asset.contentType.toLowerCase();

        const thumbnail = document.querySelector(`.${mediaType} .show-content-img`);
        const title = document.querySelector(`.${mediaType} .show-content-title`);
        const description = document.querySelector(`.${mediaType} .show-content-description`);
        const language = document.querySelector(`.${mediaType} .show-content-language`);
        const createdAt = document.querySelector(`.${mediaType} .show-content-date`);
        const createdBy = document.querySelector(`.${mediaType} .show-content-author`);
        const tags = document.querySelector(`.${mediaType} .show-content-tags`);
        const level = document.querySelector(`.${mediaType} .show-content-level`);

        createdBy.textContent = asset.createdBy.name;
        tags.textContent = asset.tags.join(', ') || '-';
        level.textContent = asset.level;
        thumbnail.src = asset.thumbnail.url;
        title.textContent = asset.title;
        description.textContent = asset.description;
        language.textContent = this.SUPPORTED_LANGUAGES[asset.language];
        createdAt.textContent = format(new Date(), 'dd/MM/yyyy HH:MM:SSS');
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
        // TODO change width, height
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
        const contentType = asset.contentType.toLowerCase();
        const rating = document.querySelector(`.${contentType} .rating`);
        if (!user) {
            rating.classList.add('hidden');
            return;
        }

        const userPreviousScore = this._getUserPreviousScore(user, asset);

        const ratingItem = rating.querySelectorAll('.rating-item');

        for (let i = 0; i < userPreviousScore; i++) {
            ratingItem[i].classList.add('active');
            if (i + 1 === userPreviousScore) {
                ratingItem[i].classList.add('current-active');
            }
        }

        rating.onclick = async (event) => {
            if (event.target.classList.contains('rating-item')) {
                const score = Number(event.target.getAttribute('data-rate'));
                await this.rateAsset(user, asset, score);
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

    _syncSort() {
        let searchParams = new URLSearchParams(location.search);

        const sortByCreatedAt = document.querySelector('.sort .sort-by_date a');
        const sortByTitle = document.querySelector('.sort .sort-by_name a');  //selected-sort
        const ascending = document.querySelector('.ascending a');
        const descending = document.querySelector('.descending a');  //selected-mode

        if (searchParams.has('sortBy')) {
            const sortBy = searchParams.get('sortBy');
            if (sortBy === 'title') {
                sortByTitle.parentElement.classList.add('selected-sort');
            } else {
                sortByCreatedAt.parentElement.classList.add('selected-sort');
            }
        } else {
            sortByCreatedAt.parentElement.classList.add('selected-sort');
        }

        if (searchParams.has('sortDir')) {
            const sortDir = searchParams.get('sortDir');
            if (sortDir === 'desc') {
                descending.parentElement.classList.add('selected-mode');
            } else {
                ascending.parentElement.classList.add('selected-mode');
            }
        } else {
            ascending.parentElement.classList.add('selected-mode');
        }

        searchParams.set('sortBy', 'createdAt');
        sortByCreatedAt.href = `index.html?${searchParams}`;

        searchParams = new URLSearchParams(location.search);
        searchParams.set('sortBy', 'title');
        sortByTitle.href = `index.html?${searchParams}`;

        searchParams = new URLSearchParams(location.search);
        searchParams.set('sortDir', 'asc');
        ascending.href = `index.html?${searchParams}`;

        searchParams = new URLSearchParams(location.search);
        searchParams.set('sortDir', 'desc');
        descending.href = `index.html?${searchParams}`;
    }
}