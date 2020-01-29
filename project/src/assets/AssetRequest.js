import validator from 'validator';

export default class AssetRequest {
    constructor(searchParams) {
        this.types = searchParams.getAll('type');
        this.levels = searchParams.getAll('level');
        this.languages = searchParams.getAll('lang');
        this.query = searchParams.get('query');
        this.page = searchParams.get('page') || '';
        this.perPage = searchParams.get('perPage') || '';
        this.sortBy = searchParams.get('sortBy') || '';
        this.sortDir = searchParams.get('sortDir') || '';

        if (!validator.isInt(this.page, {min: 1, max: Number.MAX_SAFE_INTEGER})) {
            this.page = 1;
        } else {
            this.page = Number(this.page);
        }
        if (!validator.isInt(this.perPage, {min: 5, max: 50})) {
            this.perPage = 9;
        } else {
            this.perPage = Number(this.perPage);
        }
        if (!['asc', 'desc'].includes(this.sortDir)) {
            this.sortDir = 'asc';
        }
        if (!['createdAt', 'title'].includes(this.sortBy)) {
            this.sortBy = 'createdAt';
        }
    }

    toQuickSearchRequest() {
        return {
            query: this.query,
            fields: ['title', 'description', 'tags'],
            include_docs: true
        }
    }

    toMangoRequest() {
        const request = {selector: {}};
        if (this.languages.length > 0) {
            request.selector.language = {$in: this.languages};
        }
        if (this.types.length > 0) {
            request.selector.contentType = {$in: this.types};
        }
        if (this.levels.length > 0) {
            request.selector.level = {$in: this.levels};
        }

        request.sort = [{[this.sortBy]: this.sortDir}];
        request.selector[this.sortBy] = {$gte: null};

        return request;
    }

    isQuickSearchRequest() {
        return !!this.query;
    }
}