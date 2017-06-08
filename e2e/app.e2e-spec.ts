import { TestxPage } from './app.po';

describe('testx App', () => {
  let page: TestxPage;

  beforeEach(() => {
    page = new TestxPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
