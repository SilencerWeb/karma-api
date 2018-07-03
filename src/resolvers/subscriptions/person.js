const personCreated = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.person({ where: { mutation_in: ['CREATED'] } }, info);
  },
};

const personUpdated = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.person({ where: { mutation_in: ['UPDATED'] } }, info);
  },
};

const personDeleted = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.person({ where: { mutation_in: ['DELETED'] } }, info);
  },
};


module.exports = {
  personCreated,
  personUpdated,
  personDeleted,
};