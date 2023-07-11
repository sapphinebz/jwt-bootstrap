const { Subject } = require("rxjs");
const { mergeAll, takeUntil } = require("rxjs/operators");
const { fromListener } = require("../rxjs");

function expressMap(project) {
  const onReq = new Subject();

  onReq.pipe(mergeAll()).subscribe();

  return (req, res) => {
    const connectionClose = fromListener(res, "close");
    onReq.next(project(req, res).pipe(takeUntil(connectionClose)));
  };
}

module.exports = expressMap;
