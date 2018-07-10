const file = (_, args, context, info) => {
  return context.prisma.query.file(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );
};

const files = (_, args, context, info) => {
  return context.prisma.query.files(
    {
      where: {},
    }
    , info);
};


module.exports = {
  file,
  files,
};