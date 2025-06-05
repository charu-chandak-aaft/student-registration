'use client';

import { useState } from 'react';

export default function StudentDetailsPage() {
    const [form, setForm] = useState({
        staffName: '',
        department: '',
        staffPhone: '',
        staffEmail: '',
        staffGender: '',
        firstName: '',
        lastName: '',
        studentPhone: '',
        studentEmail: '',
        state: '',
        city: '',
        school: '',
        program: '',
        studentGender: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Submitted:', form);

        // Here you can POST to MongoDB via an API route
        // await fetch('/api/student', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
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
            <div className='w-3xl max-h-[80%] mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 z-10'>
                <form onSubmit={handleSubmit} className="">
                    {/* Referred By Section */}
                    <div className="bg-red-600 px-6 py-2">
                        <h2 className="text-white text-sm md:text-sm font-bold">Student Info</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-6 py-4 relative">
                        <div>
                            <label className="block mb-1 text-sm font-semibold">First Name*</label>
                            <input name="firstName" type="text" className="w-full border border-gray-300 p-1 rounded" value={form.staffName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Last Name*</label>
                            <input name="lastname" type="text" className="w-full border border-gray-300 p-1 rounded" value={form.department} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Student Phone*</label>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center bg-black text-white px-4 text-sm rounded-l">
                                    +91
                                </span>
                                <input
                                    name="staffPhone"
                                    type="text"
                                    maxLength={10}
                                    className="w-full border border-gray-300 pl-16 pr-2 py-1 rounded"
                                    value={form.staffPhone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Email*</label>
                            <input name="studentEmail" type="email" className="w-full border border-gray-300 p-1 rounded" value={form.staffEmail} onChange={handleChange} />
                        </div>
                        <div className="col-span-full flex items-center gap-4">
                            <label className="text-sm font-semibold whitespace-nowrap">Gender*</label>
                            <div className="flex gap-6">
                                {["Male", "Female", "Other"].map((gender) => (
                                    <label key={gender} className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="studentGender"
                                            value={gender}
                                            checked={form.studentGender === gender}
                                            onChange={handleChange}
                                        />
                                        {gender}
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Reference Info Section */}
                    <div className="bg-red-600 px-6 py-2">
                        <h2 className="text-white text-sm md:text-sm font-bold">Gaurdian Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-6 py-4">
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Gaurdian First Name*</label>
                            <input name="parent_firstName" type="text" className="w-full border border-gray-300 p-1 rounded" value={form.firstName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Gaurdian Last Name*</label>
                            <input name="lastName" type="text" className="w-full border border-gray-300 p-1 rounded" value={form.lastName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Gaurdian Phone*</label>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center bg-black text-white px-4 text-sm rounded-l">
                                    +91
                                </span>
                                <input
                                    name="studentPhone"
                                    type="text"
                                    maxLength={10}
                                    className="w-full border border-gray-300 pl-16 pr-2 py-1 rounded"
                                    value={form.parentPhone}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Gaurdian Email</label>
                            <input name="studentEmail" type="email" className="w-full border border-gray-300 p-1 rounded" value={form.studentEmail} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">State*</label>
                            <select name="state" className="w-full border border-gray-300 p-1 rounded" value={form.state} onChange={handleChange}>
                                <option>Select State</option>
                                <option value="Chhattisgarh">Chhattisgarh</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Odisha">Odisha</option>
                                {/* Add more states */}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">City*</label>
                            <select name="city" className="w-full border border-gray-300 p-1 rounded" value={form.city} onChange={handleChange}>
                                <option>Select City</option>
                                <option value="Raipur">Raipur</option>
                                <option value="Bilaspur">Bilaspur</option>
                                {/* Add more cities */}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected School*</label>
                            <select name="school" className="w-full border border-gray-300 p-1 rounded" value={form.school} onChange={handleChange}>
                                <option>Select School</option>
                                <option value="School of Design">School of Design</option>
                                <option value="School of Journalism">School of Journalism</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold">Expected Program of Interest*</label>
                            <select name="program" className="w-full border border-gray-300 p-1 rounded" value={form.program} onChange={handleChange}>
                                <option>Select Program</option>
                                <option value="B.Des in Fashion">B.Des in Fashion</option>
                                <option value="B.Sc in Film">B.Sc in Film</option>
                            </select>
                        </div>
                        <div className="text-left">
                            <button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-md shadow hover:bg-red-700 transition-all duration-200">
                                Submit Details
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}

                </form>
            </div>
        </div>
    );
}
