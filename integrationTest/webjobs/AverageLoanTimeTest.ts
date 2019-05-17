require('./../SetupTestConfig');
import { createReturnBookPeriodAudit } from '../AuditGenerators';
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
  const copies = 10;
  const days = 10;
  let book: DocBook;

  beforeEach(async() => {
    // Delete all previous RETURN_BOOK audits
    const db = await getConnection();
    const auditService = new AuditService(db);
    await auditService.remove({});

    // Create copies and audits
    book = await createBook();

    let promises: Promise<DocAudit>[] = [];

    for (let i = 0; i < copies; i++) {
      promises.push(
        createReturnBookPeriodAudit(book, days)
      );
    }

    await Promise.all(promises);
  });

  it('should return the correct average loan time for the library', async() => {
    const res = await chai.request(server)
      .get('/webjobs/statistics/averageloantime')
      .send();

    expect(res.status).to.equal(200);
    expect(res.body[0].avgLoanTimeDays).to.equal(days);
  });
});
