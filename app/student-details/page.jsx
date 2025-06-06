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
        }

        setForm((prev) => ({ ...prev, studentPhone: savedPhone }));

        fetch('/api/lsq/retrieveApi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: savedPhone }),
        })
            .then((res) => res.json())
            .then((data) => {
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
                        program: courseList.includes(lead.mx_Course_Interested_In) ? lead.mx_Course_Interested_In : '',
                        prospectId: lead.ProspectID || '',
                    }));
                }
            })
            .catch((err) => {
                console.error('Error fetching LSQ lead:', err);
            });
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

        if (!form.guardianFirstName.trim()) newErrors.guardianFirstName = 'Guardian First Name is required';
        if (!form.guardianLastName.trim()) newErrors.guardianLastName = 'Guardian Last Name is required';

        if (!/^\d{10}$/.test(form.guardianPhone)) newErrors.guardianPhone = 'Valid 10-digit phone is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //     const handleSubmit = async (e) => {
    //         e.preventDefault();

    //         if (!validateForm()) return;

    //         try {
    //             const response = await fetch('/api/studentDetail', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(form),
    //             });

    //             if (!response.success) {
    //             const errorData = await studentRes.json();
    //             alert('Student detail submission failed: ' + (errorData.message || 'Unknown error'));
    //             return;
    //         }

    //         // Decide whether to update or create in LSQ
    //         const lsqEndpoint = form.prospectId ? '/api/lsq/updateApi' : '/api/lsq/createApi';

    //         const lsqRes = await fetch(lsqEndpoint, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(form),
    //         });

    //         if (!lsqRes.ok) {
    //             const errorData = await lsqRes.json();
    //             alert(`LSQ ${form.prospectId ? 'update' : 'create'} failed: ` + (errorData.message || 'Unknown error'));
    //             return;
    //         }

    //         alert('Form submitted successfully!');
    //         router.push('/thank-you'); // Optional redirect
    //     } catch (error) {
    //         console.error('Submission error:', error);
    //         alert('An error occurred during submission.');
    //     }
    // };
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
            console.log('response', response);
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     alert('Student detail submission failed: ' + (errorData.message || 'Unknown error'));
            //     return;
            // }

            // No prospectId found: call create API with all attributes
            const createBody = {
                firstName: form.firstName,
                lastName: form.lastName,
                gender: form.studentGender,
                email: form.studentEmail,
                phone: form.studentPhone,
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

                alert('Lead created successfully!');
            } catch (error) {
                console.error('Lead creation error:', error);
                alert('Something went wrong during submission.');
            }


            // else {
            //     // prospectId exists: update only if attributes from form are provided (assuming full form is updated)
            //     const updateBody = {
            //         ProspectID: form.prospectId,
            //         Attributes: [
            //             // { Attribute: "FirstName", Value: form.firstName },
            //             // { Attribute: "LastName", Value: form.lastName },
            //             // { Attribute: "mx_Gender", Value: form.studentGender },
            //             // { Attribute: "EmailAddress", Value: form.studentEmail },
            //             // { Attribute: "Phone", Value: form.studentPhone },
            //             // { Attribute: "mx_School", Value: form.school },
            //             // { Attribute: "mx_Programme", Value: form.program },
            //             // { Attribute: "mx_Course", Value: form.program },
            //             // { Attribute: "mx_City", Value: form.city },
            //             // { Attribute: "mx_State", Value: form.state },
            //             // { Attribute: "Source", Value: "Online Registration" },
            //             { Attribute: "mx_Guardian_First_Name", Value: form.guardianFirstName },
            //             // { Attribute: "mx_Guardian_Last_Name", Value: form.guardianLastName },
            //             // { Attribute: "mx_Guardian_Phone_Number", Value: form.guardianPhone },
            //             // { Attribute: "mx_Guardian_Email", Value: form.guardianEmail },
            //         ],
            //     };

            //     const updateRes = await fetch('/api/lsq/updateApi', {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify(updateBody),
            //     });

            //     if (!updateRes.ok) {
            //         const errorData = await updateRes.json();
            //         alert('Lead update failed: ' + (errorData.message || 'Unknown error'));
            //         return;
            //     }
            // }

            alert('Form submitted successfully!');
            router.push('/');
        }
        catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred during submission.');
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 relative overflow-hidden">
            <div className="max-w-3xl max-h-[80%] mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-red-600 px-6 py-2">
                        <h2 className="text-white text-sm font-bold">Student Info</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
                        {[
                            { label: 'First Name*', name: 'firstName', type: 'text' },
                            { label: 'Last Name*', name: 'lastName', type: 'text' },
                            { label: 'Email*', name: 'studentEmail', type: 'email' },
                        ].map(({ label, name, type }) => (
                            <div key={name}>
                                <label className="block mb-1 text-sm font-semibold">{label}</label>
                                <input name={name} type={type} value={form[name]} onChange={handleChange} className="w-full border p-1 rounded" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Student Phone*</label>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center bg-black text-white px-4 text-sm rounded-l">+91</span>
                                <input name="studentPhone" type="text" maxLength={10} value={form.studentPhone} readOnly className="w-full border pl-16 pr-2 py-1 rounded" />
                                {errors.studentPhone && <p className="text-red-500 text-xs mt-1">{errors.studentPhone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">State*</label>
                            <select name="state" value={form.state} onChange={handleChange} className="w-full border p-1 rounded">
                                <option value="">Select State</option>
                                {STATES.map(state => (
                                    <option key={state.id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">City*</label>
                            <select name="city" value={form.city} onChange={handleChange} disabled={!form.state} className="w-full border p-1 rounded">
                                <option value="">Select City</option>
                                {filteredCities.map(city => (
                                    <option key={city.id} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected School*</label>
                            <select name="school" value={form.school} onChange={handleChange} className="w-full border p-1 rounded">
                                <option value="">Select School</option>
                                {SCHOOL_LIST.map(school => (
                                    <option key={school} value={school}>{school}</option>
                                ))}
                            </select>
                            {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected Program of Interest*</label>
                            <select name="program" value={form.program} onChange={handleChange} disabled={!form.school} className="w-full border p-1 rounded">
                                <option value="">Select Program</option>
                                {programOptions.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                            {errors.program && <p className="text-red-500 text-xs mt-1">{errors.program}</p>}
                        </div>

                        <div className="col-span-full flex items-center gap-4">
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
                    </div>

                    <div className="bg-red-600 px-6 py-2">
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

                        <div className="col-span-full text-left">
                            <button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-md shadow hover:bg-red-700 transition-all duration-200">
                                Submit Details
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
