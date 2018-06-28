const env = process.env.NODE_ENV; // 'development' or 'production'

const development = {
  PRISMA_ENDPOINT: process.env.DEVELOPMENT_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.DEVELOPMENT_PRISMA_SECRET,
  APP_SECRET: process.env.DEVELOPMENT_APP_SECRET,
};

const production = {
  PRISMA_ENDPOINT: process.env.PRODUCTION_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.PRODUCTION_PRISMA_SECRET,
  APP_SECRET: process.env.PRODUCTION_APP_SECRET,
};

const config = {
  development,
  production,
};

module.exports = config[env];