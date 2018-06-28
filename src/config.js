const env = process.env.NODE_ENV; // 'development' or 'staging' or 'production'


const development = {
  PRISMA_ENDPOINT: process.env.DEVELOPMENT_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.DEVELOPMENT_PRISMA_SECRET,
  APP_SECRET: process.env.DEVELOPMENT_APP_SECRET,
};

const staging = {
  PRISMA_ENDPOINT: process.env.STAGING_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.STAGING_PRISMA_SECRET,
  APP_SECRET: process.env.STAGING_APP_SECRET,
};

const production = {
  PRISMA_ENDPOINT: process.env.PRODUCTION_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.PRODUCTION_PRISMA_SECRET,
  APP_SECRET: process.env.PRODUCTION_APP_SECRET,
};


const config = {
  development,
  staging,
  production,
};


module.exports = config[env];