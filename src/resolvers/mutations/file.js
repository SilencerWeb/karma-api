const { processUpload, processDelete } = require('../../utils');


const uploadFile = async(_, args, context, info) => {
  return processUpload(args.file, context, info);
};

const uploadFiles = async(_, args, context, info) => {
  return Promise.all(args.files.map((file) => processUpload(file, context)));
};

const deleteFile = async(_, args, context, info) => {
  await processDelete(args.id, context);

  return await context.prisma.mutation.deleteFile(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );
};


module.exports = {
  uploadFile,
  uploadFiles,
  deleteFile,
};