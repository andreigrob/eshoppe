export function catchFunc (next) {
  return (e) => {
      const error = new Error(e)
      error.httpStatusCode = 500
      return next(error)
  }
}

export function getInt1 (arg) {
  return +arg || 1
}

const productLimit = 8
export function Page (pageTitle, path, page, args) {
  return {
        prods: args.products,
        pageTitle,
        path,
        currentPage: page,
        hasNextPage: productLimit * page < args.count,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(args.count / productLimit),
      }
}

export default {
    catchFunc,
    getInt1,
    Page,
}