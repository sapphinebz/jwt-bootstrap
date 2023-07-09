const { exhaustMap, catchError } = require("rxjs/operators");
const { timer, EMPTY } = require("rxjs");
function axiosPolling(factory, delay) {
  return timer(0, delay).pipe(
    exhaustMap(() => factory.pipe(catchError(() => EMPTY)))
  );
}

module.exports = axiosPolling;
