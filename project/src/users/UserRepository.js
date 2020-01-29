import { format } from 'date-fns';
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

export default class UserRepository {
    constructor() {
        this.db = new PouchDB('users');
    }

    async create(email, password, name) {
        const response = await this.db.post({
            name: name,
            password: btoa(password),
            email: email,
            createdAt: format(new Date(), 'dd-MM-yyyy HH:MM:SSS'),
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