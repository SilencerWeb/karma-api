const aws = require('aws-sdk');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const config = require('./config');


const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {
    Bucket: process.env.AWS_BUCKET_NAME,
  },
});


const getUserId = (context) => {
  const Authorization = context.request.get('Authorization');

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, config.APP_SECRET);

    return userId;
  }

  throw new Error('Not authorized');
};


const processUpload = async(upload, context, info) => {
  if (!upload) {
    return console.log('No file received.');
  }

  const file = await upload;

  const fileExtension = file.filename.split('.').pop();

  const filename = `${uuid()}.${fileExtension}`;

  const response = await s3.upload({ Key: filename, ACL: 'public-read', Body: file.stream, }).promise();

  return context.prisma.mutation.createFile(
    {
      data: {
        filename: filename,
        mimetype: file.mimetype,
        encoding: file.encoding,
        url: response.Location,
      },
    },
    info);
};

const processDelete = async(id, context) => {
  const file = await context.prisma.query.file(
    {
      where: {
        id: id,
      },
    },
    `
      {
        filename
      }
    `,
  );

  return await s3.deleteObject({ Key: file.filename }).promise();
};


const updatePersonKarma = async(personId, context) => {
  const person = await context.prisma.query.person(
    {
      where: {
        id: personId,
      },
    },
    `
     {
      actions {
        karma
        executors
        members {
          person {
            id
          }
          isUser
          side
        }
      }
     }
    `,
  );

  let karma = 0;

  person.actions.forEach((action) => {
    action.members.forEach((member) => {
      if (!member.isUser && member.person.id === personId && member.side === action.executors) {
        action.karma === 'positive' ? ++karma : --karma;
      }
    });
  });

  return context.prisma.mutation.updatePerson(
    {
      where: {
        id: personId,
      },
      data: {
        karma: karma,
      },
    },
  );
};

const updatePersonsKarma = async(context) => {
  const userId = getUserId(context);

  const persons = await context.prisma.query.persons(
    {
      where: {
        author: {
          id: userId,
        },
      },
    },
    `
      {
        id
      }
    `,
  );

  return persons.forEach(async(person) => {
    return await updatePersonKarma(person.id, context);
  });
};


module.exports = {
  getUserId,

  processUpload,
  processDelete,

  updatePersonsKarma,
};