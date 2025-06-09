'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { CITIES, STATES, getStateIdByName } from '../lib/states';
import { getCourseList, SCHOOL_LIST } from "../lib/school_program";

export default function StudentDetailsPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        studentPhone: '',
        studentEmail: '',
        studentGender: '',
        address: '',
        guardianFirstName: '',
        guardianLastName: '',
        guardianPhone: '',
        guardianEmail: '',
        state: '',
        city: '',
        school: '',
        program: '',
        prospectId: ''
    });

    const [errors, setErrors] = useState({});
    const [filteredCities, setFilteredCities] = useState([]);
    const [programOptions, setProgramOptions] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fetchLeadDetails = async (phone) => {
        try {
            const res = await fetch('/api/lsq/retrieveApi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                const lead = data[0];
                const school = lead.mx_School || '';
                const courseList = getCourseList(school) || [];
                setProgramOptions(courseList);

                setForm((prev) => ({
                    ...prev,
                    firstName: lead.FirstName || '',
                    lastName: lead.LastName || '',
                    studentEmail: lead.EmailAddress || '',
                    city: lead.mx_City || '',
                    state: lead.mx_State || '',
                    school,
                    address: lead.mx_Street1 || '',
                    program: courseList.includes(lead.mx_Course_Interested_In) ? lead.mx_Course_Interested_In : '',
                    prospectId: lead.ProspectID || '',
                    studentGender: lead.mx_Gender || '',
                    guardianFirstName: lead.mx_Guardian_First_Name || '',
                    guardianLastName: lead.mx_Guardian_Last_Name || '',
                    guardianEmail: lead.mx_Guardian_Email || '',
                    guardianPhone: lead.mx_Guardian_Phone_Number || '',
                }));
            }
        } catch (err) {
            console.error('Error fetching LSQ lead:', err);
        }
    };


    useEffect(() => {
        if (form.state) {
            const stateId = getStateIdByName(form.state);
            const cities = CITIES.filter(city => city.state_id === stateId);
            setFilteredCities(cities);
        } else {
            setFilteredCities([]);
        }
    }, [form.state]);

    useEffect(() => {
        if (form.school) {
            const courseList = getCourseList(form.school) || [];
            setProgramOptions(courseList);
        } else {
            setProgramOptions([]);
        }
    }, [form.school]);
    useEffect(() => {
        const savedPhone = localStorage.getItem('registrationPhone');
        if (!savedPhone) {
            router.push('/');
        } else {
            setForm((prev) => ({ ...prev, studentPhone: savedPhone }));
            fetchLeadDetails(savedPhone); // hit retrieve API on load
        }
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'state' && { city: '' }),
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!form.lastName.trim()) newErrors.lastName = 'Last Name is required';

        if (!/^\d{10}$/.test(form.studentPhone)) newErrors.studentPhone = 'Enter a valid 10-digit phone number';

        if (!form.studentEmail || !/^\S+@\S+\.\S+$/.test(form.studentEmail))
            newErrors.studentEmail = 'Valid email is required';

        if (!form.studentGender) newErrors.studentGender = 'Gender is required';
        if (!form.state) newErrors.state = 'State is required';
        if (!form.city) newErrors.city = 'City is required';
        if (!form.school) newErrors.school = 'School is required';
        if (!form.program) newErrors.program = 'Program is required';
        if (!form.address) newErrors.address = 'Address is required';
        if (!form.guardianFirstName.trim()) newErrors.guardianFirstName = 'Guardian First Name is required';
        if (!form.guardianLastName.trim()) newErrors.guardianLastName = 'Guardian Last Name is required';

        if (!/^\d{10}$/.test(form.guardianPhone)) newErrors.guardianPhone = 'Valid 10-digit phone is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await fetch('/api/studentDetail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            // console.log('response', response);
            const createBody = {
                firstName: form.firstName,
                lastName: form.lastName,
                gender: form.studentGender,
                email: form.studentEmail,
                phone: form.studentPhone,
                address: form.address,
                school: form.school,
                program: form.program,
                course: form.program, // Assuming course and program are the same
                city: form.city,
                state: form.state,
                referralId: form.referralId || '', // Optional
                staffName: form.staffName || '',   // Optional
                guardianFirstName: form.guardianFirstName,
                guardianLastName: form.guardianLastName,
                guardianPhone: form.guardianPhone,
                guardianEmail: form.guardianEmail,
            };

            try {
                const createRes = await fetch('/api/lsq/createApi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(createBody), // ✅ This will match what your API route expects
                });

                const result = await createRes.json();

                if (!createRes.ok) {
                    alert('Lead creation failed: ' + (result?.error || 'Unknown error'));
                    return;
                }
                else {
                    const queryParams = new URLSearchParams({
                        school: createBody.school || '',
                        program: createBody.program || '',
                        StudentName: `${createBody.firstName || ''} ${createBody.lastName || ''}`.trim(),
                        email: createBody.email || '',
                        phone: createBody.phone || '',
                        prosId: form.prospectId ? '1' : '0' || '', // You don't have prospectId in createBody, so default to '0'
                        address: createBody.address || '',
                        guardianName: `${createBody.guardianFirstName || ''} ${createBody.guardianLastName || ''}`.trim(),
                    }).toString();
                    await fetchLeadDetails(form.studentPhone); // fetch again after creation or update
                    setShowSuccessModal(true);
                }

            } catch (error) {
                console.error('Lead creation error:', error);
                alert('Something went wrong during submission.');
            }
            // router.push('/');
        }
        catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred during submission.');
        }
    };
    const handleProceedToPay = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const dataToSave = {
            firstName: form.firstName,
            lastName: form.lastName,
            gender: form.studentGender,
            email: form.studentEmail,
            phone: form.studentPhone,
            address: form.address,
            school: form.school,
            program: form.program,
            course: form.program,
            city: form.city,
            state: form.state,
            referralId: form.referralId || '',
            staffName: form.staffName || '',
            guardianFirstName: form.guardianFirstName,
            guardianLastName: form.guardianLastName,
            guardianPhone: form.guardianPhone,
            guardianEmail: form.guardianEmail,
            prospectId: form.prospectId,
        };
        const queryParams = new URLSearchParams({
            school: dataToSave.school || '',
            program: dataToSave.program || '',
            StudentName: `${dataToSave.firstName || ''} ${dataToSave.lastName || ''}`.trim(),
            email: dataToSave.email || '',
            phone: dataToSave.phone || '',
            prosId: dataToSave.prospectId ? '1' : '0' || '',
            address: dataToSave.address || '',
            guardianName: `${dataToSave.guardianFirstName || ''} ${dataToSave.guardianLastName || ''}`.trim(),
        }).toString();

        // Navigate to URL with query params
        router.push(`https://aaft.edu.in/hdfc-pay/hdfcform?${queryParams}`);
    };
    const handleCancel = (e) => {
        setShowSuccessModal(false);
        router.push(`https://aaft.edu.in/`);
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 relative overflow-hidden">
            <div className="hidden md:block absolute left-0 bottom-0 w-1/4 z-0">
                <img
                    src="/left_bgImage.png" // replace with your image path
                    alt="Left Background"
                    className="object-cover"
                />
            </div>

            {/* Right Background Image */}
            <div className="hidden md:block absolute right-0 bottom-0 w-1/4 z-0">
                <img
                    src="/right_bgImage.png" // replace with your image path
                    alt="Right Background"
                    className="object-cover"
                />
            </div>
            <div className="max-w-3xl max-h-[80%] mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-black px-6 py-2">
                        <h2 className="text-white text-sm font-bold">Student Info</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
                        {[
                            { label: 'First Name*', name: 'firstName', type: 'text' },
                            { label: 'Last Name*', name: 'lastName', type: 'text' },
                            // { label: 'Email*', name: 'studentEmail', type: 'email' },
                        ].map(({ label, name, type }) => (
                            <div key={name}>
                                <label className="block mb-1 text-sm font-semibold">{label}</label>
                                <input name={name} type={type} value={form[name]} onChange={handleChange} className="w-full border p-1 rounded" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Email*</label>
                            <input
                                name="studentEmail"
                                type="email"
                                value={form.studentEmail}
                                onChange={handleChange}
                                disabled={!!form.studentEmail}
                                className="w-full border p-1 rounded disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Student Phone*</label>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center bg-black text-white px-4 text-sm rounded-l">+91</span>
                                <input name="studentPhone" type="text" maxLength={10} value={form.studentPhone} disabled className="w-full border pl-16 pr-2 py-1 rounded disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed" />
                                {errors.studentPhone && <p className="text-red-500 text-xs mt-1">{errors.studentPhone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">State*</label>
                            <select name="state" value={form.state} onChange={handleChange} className="w-full border p-1 rounded">
                                <option value="">Select State</option>
                                {STATES.map(state => (
                                    <option key={state.state_id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">City*</label>
                            <select name="city" value={form.city} onChange={handleChange} className="w-full border p-1 rounded">
                                <option value="">Select City</option>
                                {filteredCities.map(city => (
                                    <option key={city.name} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected School*</label>
                            <select
                                name="school"
                                value={form.school}
                                onChange={handleChange}
                                disabled={!!form.school}
                                className="w-full border p-1 rounded disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
                            >
                                <option value="">Select School</option>
                                {SCHOOL_LIST.map((school) => (
                                    <option key={school} value={school}>
                                        {school}
                                    </option>
                                ))}
                            </select>
                            {errors.school && (
                                <p className="text-red-500 text-xs mt-1">{errors.school}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected Program of Interest*</label>
                            <select name="program" value={form.program} onChange={handleChange} disabled={!!form.program} className="w-full border p-1 rounded disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed">
                                <option value="">Select Program</option>
                                {programOptions.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                            {errors.program && <p className="text-red-500 text-xs mt-1">{errors.program}</p>}
                        </div>

                        <div className="">
                            <label className="text-sm font-semibold">Gender*</label>
                            <div className="flex gap-4">
                                {['Male', 'Female', 'Other'].map(gender => (
                                    <label key={gender} className="flex items-center gap-1">
                                        <input type="radio" name="studentGender" value={gender} checked={form.studentGender === gender} onChange={handleChange} />
                                        {gender}
                                    </label>
                                ))}
                            </div>
                            {errors.studentGender && <p className="text-red-500 text-xs mt-1">{errors.studentGender}</p>}
                        </div>
                        <div className="">
                            <label className="text-sm font-semibold">
                                Address*
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                                placeholder="Enter your address"
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-black px-6 py-2">
                        <h2 className="text-white text-sm font-bold">Guardian Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
                        {[
                            { label: 'Guardian First Name*', name: 'guardianFirstName' },
                            { label: 'Guardian Last Name*', name: 'guardianLastName' },
                            { label: 'Guardian Email', name: 'guardianEmail', type: 'email' },
                        ].map(({ label, name, type = 'text' }) => (
                            <div key={name}>
                                <label className="block mb-1 text-sm font-semibold">{label}</label>
                                <input name={name} type={type} value={form[name]} onChange={handleChange} className="w-full border p-1 rounded" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Guardian Phone*</label>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center bg-black text-white px-4 text-sm rounded-l">+91</span>
                                <input name="guardianPhone" type="text" maxLength={10} value={form.guardianPhone} onChange={handleChange} className="w-full border pl-16 pr-2 py-1 rounded" />
                            </div>
                            {errors.guardianPhone && <p className="text-red-500 text-xs mt-1">{errors.guardianPhone}</p>}
                        </div>

                        {/* <div className="col-span-full text-left">
                            <button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-md shadow hover:bg-red-700 transition-all duration-200">
                                Submit Details
                            </button>
                        </div> */}
                        <div className="text-left">
                            <button
                                type="submit"
                                className={`${form.prospectId ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                                    } text-white px-8 py-2 rounded-md shadow transition-all duration-200 cursor-pointer`}
                            >
                                {form.prospectId ? 'Update' : 'Register'}
                            </button>
                        </div>
                        {form.prospectId && (
                            <div className="text-right">
                                <button
                                    // type="submit"
                                    onClick={handleProceedToPay}
                                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md shadow transition-all duration-200 cursor-pointer"
                                >
                                    Proceed To Pay &gt;&gt;
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-sm">
                        <h2 className="text-xl font-bold text-red-900 mb-2">Thank You.</h2>
                        <p className="text-sm mb-4">You will now be redirected to pay....</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleProceedToPay}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition cursor-pointer"
                            >
                                Proceed To Pay &gt;&gt;
                            </button>
                            <button
                                onClick={handleCancel}
                                className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </div>

    );
}
