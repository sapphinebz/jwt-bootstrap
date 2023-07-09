const {
  NEVER,
  Observable,
  ReplaySubject,
  Subject,
  EMPTY,
  identity,
  connectable,
} = require("rxjs");
const {
  throttleTime,
  exhaustMap,
  tap,
  takeUntil,
  catchError,
  retry,
} = require("rxjs/operators");

function cache(options) {
  const { windowTime, cleanUpWhen } = options;
  const cleanupFn = cleanUpWhen ? takeUntil(cleanUpWhen) : identity;
  return (source) => {
    const reqRefresh = new Subject();

    const connectable$ = connectable(
      reqRefresh.pipe(
        throttleTime(windowTime),
        exhaustMap(() => {
          return source.pipe(
            retry({
              delay: 200,
              count: 2,
            }),
            catchError(() => EMPTY)
          );
        }),
        cleanupFn
      ),
      { connector: () => new ReplaySubject(1) }
    );

    connectable$.connect();

    return new Observable((subscriber) => {
      reqRefresh.next();
      return connectable$.subscribe({
        next: (value) => {
          subscriber.next(value);
          subscriber.complete();
        },
      });
    });
  };
}

module.exports = cache;
