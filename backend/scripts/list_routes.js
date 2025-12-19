const app = require('../server');

function listRoutes() {
  const routes = [];
  app._router.stack.forEach((mw) => {
    if (mw.route) {
      const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
      routes.push({ path: mw.route.path, methods });
    } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
      mw.handle.stack.forEach((r) => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).join(',').toUpperCase();
          routes.push({ path: r.route.path, methods });
        }
      });
    }
  });
  console.log(routes);
}

listRoutes();
