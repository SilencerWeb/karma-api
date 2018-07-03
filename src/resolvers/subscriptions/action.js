const actionCreated = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.action({ where: { mutation_in: ['CREATED'] } }, info);
  },
};

const actionUpdated = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.action({ where: { mutation_in: ['UPDATED'] } }, info);
  },
};

const actionDeleted = {
  subscribe: (_, args, context, info) => {
    return context.prisma.subscription.action({ where: { mutation_in: ['DELETED'] } }, info);
  },
};


module.exports = {
  actionCreated,
  actionUpdated,
  actionDeleted,
};