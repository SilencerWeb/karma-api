const user = async({ user: { id } }, args, context, info) => {
  return context.prisma.query.user({ where: { id } }, info);
};


module.exports = { user };