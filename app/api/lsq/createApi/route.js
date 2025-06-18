import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      firstName,
      lastName,
      gender,
      email,
      phone,
      school,
      program,
      course,
      city,
      state,
      referralId,
      address,
      staffName,
      guardianFirstName,
      guardianLastName,
      guardianPhone,
      guardianEmail,
    } = data;

    // Ensure required fields are present
    if (!firstName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare payload as array of { Attribute, Value } objects
    const payload = [
      { Attribute: "FirstName", Value: firstName },
      { Attribute: "LastName", Value: lastName || '' },
      { Attribute: "mx_Gender", Value: gender || '' },
      { Attribute: "EmailAddress", Value: email },
      { Attribute: "Phone", Value: phone },
      { Attribute: "mx_School", Value: school || '' },
      { Attribute: "mx_Programme", Value: program || '' },
      { Attribute: "mx_Course_Interested_In", Value: course || program || '' },
      { Attribute: "mx_City", Value: city || '' },
      { Attribute: "mx_State", Value: state || '' },
      { Attribute: "mx_Street1", Value: address || '' },
      { Attribute: "Source", Value: "Admission Portal" },
      { Attribute: "mx_utm_term_remarketing", Value: referralId || '' },
      { Attribute: "mx_Sanctioning_Body", Value: staffName || '' },
      { Attribute: "mx_Guardian_First_Name", Value: guardianFirstName || '' },
      { Attribute: "mx_Guardian_Last_Name", Value: guardianLastName || '' },
      { Attribute: "mx_Guardian_Phone_Number", Value: guardianPhone || '' },
      { Attribute: "mx_Guardian_Email", Value: guardianEmail || '' },
    ];

    // Log endpoint being hit for debugging (remove in production)
    console.log('Sending data to:', process.env.CRM_CREATE_ENDPOINT);

    const createResponse = await fetch(process.env.CRM_CREATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await createResponse.json();

    // Handle response
    if (!createResponse.ok || result?.Status !== 'Success') {
      return NextResponse.json({
        error: 'Lead creation failed',
        result
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'LSQ lead created', result });
  } catch (error) {
    console.error('LSQ Create API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
