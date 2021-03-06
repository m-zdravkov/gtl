export const notificationConstats = {
  email: {
    BOOK_OVERDUE: {
      PROFESSOR: {
        subject: 'GTL Overdue book',
        content: 'A professor with <professorEmail> has an overdue book: <bookTitle> with ISBN: ' +
          '<ISBN> that should be returned as soon as possible'
      },
      NORMAL_USER: {
        subject: 'GTL Overdue book',
        content: 'You have an overdue book: <bookTitle> with ISBN: ' +
          '<ISBN> that should be returned as soon as possible'
      }
    },
    MEMBER_CARD_NEAR_EXPIRATION: {
      subject: 'GTL Member card expiration',
      content: 'Your member card is about to expire in <daysUntilExpiration> days.'
    }
  }
};
