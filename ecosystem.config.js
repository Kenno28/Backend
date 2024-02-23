module.exports = {
    apps : [{
      name: "BackenServer",
      script: "./src/app.ts",
      watch: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }]
  };
  