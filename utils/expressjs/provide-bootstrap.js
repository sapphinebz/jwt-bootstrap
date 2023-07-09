function provideBootstrap(app) {
  bootstrapCSS(app, "/bootstrap.min.css");
  bootstrapJS(app, "/bootstrap.bundle.min.js");
}

function bootstrapJS(app, jsfile) {
  app.get(`${jsfile}`, (req, res) => {
    res.sendFile(`${process.cwd()}/node_modules/bootstrap/dist/js${jsfile}`);
  });
}

function bootstrapCSS(app, cssfile) {
  app.get(`${cssfile}`, (req, res) => {
    res.sendFile(`${process.cwd()}/node_modules/bootstrap/dist/css${cssfile}`);
  });
}

module.exports = provideBootstrap;
