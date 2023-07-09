const { Subject } = require("rxjs");
const { mergeAll } = require("rxjs/operators");

function expressMap(project) {
  const onReq = new Subject();

  onReq.pipe(mergeAll()).subscribe();

  return (req, res) => {
    onReq.next(project(req, res));
  };
}

module.exports = expressMap;
