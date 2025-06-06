// import mysql from 'mysql2/promise';
// export const db = await mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'aaft-uni-student-registration',
// });
// const users = new Map();

import { prisma } from './prisma.js';

export async function findOrCreateUser(mobile) {
  let user = await prisma.studentRegistration.findUnique({
    where: { mobile },
  });

  if (!user) {
    user = await prisma.studentRegistration.create({
      data: { mobile },
    });
  }

  return user;
}