require('./../SetupTestConfig');
import {createBook, createBookCopy} from '../CommonIntegrationGenerators';
import {DocBook} from '../../app/models/book/Book';
import {server} from '../../server';
import * as chai from 'chai';
import {getConnection} from '../../app/components/database/DbConnect';
import {actionEnum, modelEnum} from '../../app/components/constants/models/audit/auditConstants';
import {AuditService} from '../../app/services/audit/AuditService';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

before(async () => {
    while (!global.masterDbReady) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
});

describe('The webjob getMostLoanedBook', () => {
    let book: DocBook;
    let book2: DocBook;
    let bookCopy;

    beforeEach(async() => {
        // Delete all previous RETURN_BOOK audits
        const db = await getConnection();
        const auditService = new AuditService(db);
        await auditService.remove({});

        // Create copies and audits
        book = await createBook();
        book2 = await createBook();
        bookCopy = await createBookCopy(book);
        await auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.LOAN_BOOK, bookCopy._id,
                                       bookCopy);
        bookCopy = await createBookCopy(book);
        await auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.LOAN_BOOK, bookCopy._id,
                                       bookCopy);
        bookCopy = await createBookCopy(book2);
        await auditService.createAudit(modelEnum.BOOK_COPY, actionEnum.LOAN_BOOK, bookCopy._id,
                                       bookCopy);
    });

    it('should return the most loaned book', async() => {

        const res = await chai.request(server)
            .get('/webjobs/statistics/mostLoanedBook')
            .send();

        expect(res.status).to.equal(200);
        expect(res.body.books[0].ISBN).to.equal(book.ISBN);
    });

    it('should return the correct loanTimes ', async() => {

        const res = await chai.request(server)
            .get('/webjobs/statistics/mostLoanedBook')
            .send();

        expect(res.status).to.equal(200);
        expect(res.body.loanTimes).to.equal(2);
    });
});
