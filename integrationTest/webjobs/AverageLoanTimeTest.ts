require('./../SetupTestConfig');
import { createReturnBookPeriodAudits } from '../AuditGenerators';
import { DocAudit } from '../../app/models/audit/Audit';
import { createBook } from '../CommonIntegrationGenerators';
import { DocBook } from '../../app/models/book/Book';
import { server } from '../../server';
import * as chai from 'chai';
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
import { fail } from 'assert';
import { getMongoService } from '../../app/services/general/MongoService';
import { getConnection } from '../../app/components/database/DbConnect';
import { actionEnum, modelEnum } from '../../app/components/constants/models/audit/auditConstants';
import { AuditService } from '../../app/services/audit/AuditService';

before(async () => {
  while (!global.masterDbReady) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

describe('The webjob getAverageLoanTime', () => {
  let book: DocBook;

  beforeEach(async() => {
    // Delete all previous RETURN_BOOK audits
    const db = await getConnection();
    const auditService = new AuditService(db);
    await auditService.remove({});

    // Create copies and audits
    book = await createBook();
  });

  it('should return the correct average loan time in days for 10-day loans', async() => {
    const days = 10;
    const hours = days * 24;
    const copies = 10;
    await createReturnBookPeriodAudits(book, hours, copies);

    const res = await chai.request(server)
      .get('/webjobs/statistics/averageloantime')
      .send();

    expect(res.status).to.equal(200);
    expect(res.body[0].avgLoanTimeDays).to.equal(days);
  });

  it('should return the correct average loan time in HOURS for under-a-day loans', async() => {
    const days = 0.25; // 6 hours loan
    const hours = days * 24;
    const copies = 12; // 6h * 12 copies = 3 days total loan
    await createReturnBookPeriodAudits(book, hours, copies);

    const res = await chai.request(server)
      .get('/webjobs/statistics/averageloantime')
      .send();

    expect(res.status).to.equal(200);
    expect(res.body[0].avgLoanTimeHours).to.equal(hours);
  });

  it('should return the correct average loan time in DAYS for under-a-day loans', async() => {
    const days = 0.25; // 6 hours loan
    const hours = days * 24;
    const copies = 12; // 6h * 12 copies = 3 days total loan
    await createReturnBookPeriodAudits(book, hours, copies);

    const res = await chai.request(server)
      .get('/webjobs/statistics/averageloantime')
      .send();

    expect(res.status).to.equal(200);
    expect(res.body[0].avgLoanTimeDays).to.equal(days);
  });

  it('should return the correct average loan time for various loan periods', async() => {
    await createReturnBookPeriodAudits(book, 8, 1);
    await createReturnBookPeriodAudits(book, 12, 1);
    await createReturnBookPeriodAudits(book, 36, 1);
    await createReturnBookPeriodAudits(book, 40, 1);

    const res = await chai.request(server)
      .get('/webjobs/statistics/averageloantime')
      .send();

    expect(res.status).to.equal(200);
    expect(res.body[0].avgLoanTimeDays).to.equal(1);
  });

});
