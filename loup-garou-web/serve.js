const featurePolicy = require("feature-policy");
const serveStatic = require('serve-static');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const app = express();

app.use(helmet({
    frameguard: { action: 'sameorigin' },
    referrerPolicy: { policy: 'no-referrer' },
    dnsPrefetchControl: { allow: false },
    hidePoweredBy: true,
    xssFilter: true,
    expectCt: { maxAge: 86400, enforce: true },
    hsts: true,
    noSniff: true,
    ieNoOpen: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'"],
        'object-src': ["'none'"],
        'script-src': ["'self'"],
        'script-src-attr': ["'unsafe-inline'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'connect-src': ["'self'", '127.0.0.1:5030', 'localhost:5030', 'loupgarouweb.com:5030']
      }
    }
}));
app.use(
    featurePolicy({
      features: {
        camera: ["'none'"],
        documentDomain: ["'self'"],
        payment: ["'none'"]
      },
    })
  );
app.use(serveStatic(path.join(__dirname, 'dist', 'PolyChemins')));

const port = 8080
app.listen(port, () => {
    console.log(`Shhhh the server is listening on port ${port}...`);
});
