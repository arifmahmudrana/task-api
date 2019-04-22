const paginate = require('express-paginate');
const qs = require('qs');
const url = require('url');

const getPages = (req, pageCount) => {
  if (pageCount < 1) {
    return null;
  }

  return {
    previousPage: previousPage(req),
    firstPage: firstPage(req),
    lastPage: lastPage(req, pageCount),
    nextPage: nextPage(req, pageCount),
    pages: paginate
      .getArrayPages(req)(10, pageCount, req.query.page)
      .map(({ url }) => process.env.ROOT_URL + url)
  };
};

const previousPage = req => {
  if (req.query.page < 2) {
    return null;
  }

  return process.env.ROOT_URL + paginate.href(req)(true);
};

const firstPage = req => {
  const query = { ...req.query, page: 1 };

  return (
    process.env.ROOT_URL +
    url.parse(req.originalUrl).pathname +
    '?' +
    qs.stringify(query)
  );
};

const lastPage = (req, pageCount) => {
  const query = { ...req.query, page: pageCount };

  return (
    process.env.ROOT_URL +
    url.parse(req.originalUrl).pathname +
    '?' +
    qs.stringify(query)
  );
};

const nextPage = (req, pageCount) => {
  if (!paginate.hasNextPages(req)(pageCount)) {
    return null;
  }

  return process.env.ROOT_URL + paginate.href(req)();
};

module.exports = getPages;
