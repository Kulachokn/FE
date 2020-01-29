import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(require('pouchdb-quick-search'));

export default class AssetRepository {

    constructor() {
        this.db = new PouchDB('assets');
        this.CONTENT_TYPES = {
            BOOK: 'BOOK',
            VIDEO: 'VIDEO',
            AUDIO: 'AUDIO'
        };

        this.pendingIndecies = [];

        if (this.db.search) {
            this.pendingIndecies.push(this.db.search({
                fields: ['title', 'description', 'tags'],
                build: true
            }));
        }

        this.pendingIndecies.push(this.db.createIndex({
            index: {
                fields: ['contentType']
            }
        }));
        this.pendingIndecies.push(this.db.createIndex({
            index: {
                fields: ['level']
            }
        }));
        this.pendingIndecies.push(this.db.createIndex({
            index: {
                fields: ['language']
            }
        }));
        this.pendingIndecies.push(this.db.createIndex({
            index: {
                fields: ['createdAt']
            }
        }));
        this.pendingIndecies.push(this.db.createIndex({
            index: {
                fields: ['title']
            }
        }));

        this.pendingIndecies = Promise.all(this.pendingIndecies);
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
        await this.pendingIndecies;

        const left = (request.page - 1) * request.perPage;
        const right = left + request.perPage;

        let response;
        if (request.isQuickSearchRequest()) {
            response = await this.db.search(request.toQuickSearchRequest());
            const assets = [];

            for (let row of response.rows) {
                if (request.types.length && !request.types.includes(row.doc.contentType)) continue;
                if (request.levels.length && !request.levels.includes(row.doc.level)) continue;
                if (request.languages.length && !request.languages.includes(row.doc.language)) continue;
                assets.push(row.doc);
            }

            response.total_rows = assets.length;

            response.rows = assets.slice(left, right);
        } else {
            response = await this.db.find(request.toMangoRequest());
            const totalCount = response.docs.length;
            response.docs = response.docs.slice(left, right);

            response = {
                total_rows: totalCount,
                rows: response.docs
            }
        }
        response.page = request.page;
        response.perPage = request.perPage;

        console.log(response);
        return response;
    }
}