const env = process.env.NODE_ENV; // 'local', 'development' or 'staging' or 'production'


const local = {
  PRISMA_ENDPOINT: process.env.DEVELOPMENT_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.DEVELOPMENT_PRISMA_SECRET,
  APP_SECRET: process.env.DEVELOPMENT_APP_SECRET,
  debug: true,
};

const development = {
  PRISMA_ENDPOINT: process.env.DEVELOPMENT_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.DEVELOPMENT_PRISMA_SECRET,
  APP_SECRET: process.env.DEVELOPMENT_APP_SECRET,
  debug: false,
};

const staging = {
  PRISMA_ENDPOINT: process.env.STAGING_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.STAGING_PRISMA_SECRET,
  APP_SECRET: process.env.STAGING_APP_SECRET,
  debug: false,
};

const production = {
  PRISMA_ENDPOINT: process.env.PRODUCTION_PRISMA_ENDPOINT,
  PRISMA_SECRET: process.env.PRODUCTION_PRISMA_SECRET,
  APP_SECRET: process.env.PRODUCTION_APP_SECRET,
  debug: false,
};


const config = {
  local,
  development,
  staging,
  production,
};


module.exports = config[env];