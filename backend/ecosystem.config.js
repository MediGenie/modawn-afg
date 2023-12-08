module.exports = {
    apps : [{
      name   : "modawn-backend-app",
      script : "./bin/www",
      env: {
        DEBUG: "backend:*",
        NODE_ENV: "development",
      }
    }]
  };