import {Book} from '../../app/models/book/Book';
import {User} from '../../app/models/user/User';
import {Campus} from '../../app/models/campus/Campus';
import {BookCopy} from '../../app/models/book/BookCopy';
import {
    createBook,
    createBookCopy,
    createCampus,
    createUser
} from '../MockGenerators';
import {maxLoans, userTypesEnum} from '../../app/components/constants/models/user/userConstants';
import * as chai from 'chai';
import {getConnection} from '../../app/components/database/DbConnect';
import * as moment from 'moment';
import {returnPeriod} from '../../app/components/constants/models/book/bookConstants';
import {stub} from 'sinon';
import {loanBook} from '../../app/controllers/book/BookCtrl';
import * as dbConnect from '../../app/components/database/DbConnect';
import {UserService} from '../../app/services/user/UserService';
import {BookService} from '../../app/services/book/BookService';
import {AuditService} from '../../app/services/audit/AuditService';

const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Loan book', () => {
    let book: Book;
    let user: User;
    let campus: Campus;
    let copy: BookCopy;
    let dbStub, bookFind1Stub, userFind1Stub, auditStub;

    beforeEach(() => {
        dbStub = stub (dbConnect, 'getConnection').resolves(null);
        auditStub = stub (AuditService.prototype, 'createAudit').resolves();
        campus = createCampus();
        user = createUser(userTypesEnum.NORMAL_USER, campus._id);
        book = createBook();
        copy = createBookCopy(book);
        book.bookCopies.push(copy);
    });
    afterEach(() => {
        dbStub.restore();
        bookFind1Stub.restore();
        userFind1Stub.restore();
        auditStub.restore();
    });

    it('should set takenDate to same or before now', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        const loanedBook = await loanBook(req);
        const takenDate = loanedBook.takenDate;
        expect(moment(takenDate).isSameOrBefore(moment())).to.be.equal(true);
    });

    it('should set returnDate to user return period after takenDate', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        const loanedBook = await loanBook(req);
        const takenDate = loanedBook.takenDate;
        const returnDate = loanedBook.expectedReturnDate;
        const userReturnPeriod = returnPeriod.NORMAL_USER.period;
        const userReturnUnit = returnPeriod.NORMAL_USER.unit as
            moment.unitOfTime.DurationConstructor;

        expect(moment(takenDate).add(userReturnPeriod, userReturnUnit)
            .isSame(moment(returnDate))).to.be.equal(true);
    });

    it('should not be available', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        const loanedBook = await loanBook(req);
        const available = loanedBook.available;

        expect(available).to.be.equal(false);
    });

    it('should register the book copy in user', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        const loanedBook = await loanBook(req);

        expect(user.takenBooks).to.include(loanedBook);
    });

    it('should not find unexisting book ISBN', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(undefined);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        let msg;
        try {
            await loanBook(req);
        } catch (e) {
            msg = e.msg;
        }
        expect(msg).to.equal('Book ISBN not found');


    });

    it('should not find unexisting user SSN', async() => {
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(undefined);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        let msg;
        try {
            await loanBook(req);
        } catch (e) {
            msg = e.msg;
        }
        expect(msg).to.equal('User SSN not found');

    });

    it('should not lend restricted book', async() => {
        book.lendingRestrictions = ['restricted'];
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        let msg;
        try {
            await loanBook(req);
        } catch (e) {
            msg = e.msg;
        }
        expect(msg).to.equal('Book is restricted');
    });

    it('should not lend book when loan maximum is reached', async() => {
        for (let i = 0; i < maxLoans; i++) {
            user.takenBooks.push('' + i);
        }
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        let msg;
        try {
            await loanBook(req);
        } catch (e) {
            msg = e.msg;
        }
        expect(msg).to.equal(`User can not loan more than ${maxLoans} books`);
    });

    it('should not lend book when there are no available copies', async() => {
        userFind1Stub =  stub(UserService.prototype, 'findOne').resolves(user);
        bookFind1Stub =  stub(BookService.prototype, 'findOne').resolves(book);
        copy.available = false;
        book.bookCopies = [copy];
        const req: any = {body: {ssn: 'dummyssn'}, params: {isbn: 'dummyisbn'}};
        let msg;
        try {
            await loanBook(req);
        } catch (e) {
            msg = e.msg;
        }
        copy.available = true;
        expect(msg).to.equal('No copies are available');
    });
});
