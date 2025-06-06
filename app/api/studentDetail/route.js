import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      studentPhone,
      studentEmail,
      studentGender,
      state,
      city,
      school,
      program,
      guardianFirstName,
      guardianLastName,
      guardianPhone,
      guardianEmail,
      prospectId,
    } = body;

    // Check if studentPhone already exists
    const existingStudent = await prisma.studentDetails.findUnique({
      where: { studentPhone },
    });

    if (existingStudent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Student with this phone already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new record
    const studentdetails = await prisma.studentDetails.create({
      data: {
        firstName,
        lastName,
        studentPhone,
        studentEmail,
        studentGender,
        state,
        city,
        school,
        program,
        guardianFirstName,
        guardianLastName,
        guardianPhone,
        guardianEmail,
        prospectId,
      },
    });

    return new Response(
      JSON.stringify({ success: true, studentdetails }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating student registration:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
