"use client";

import { useState } from "react";

export default function MockJobApplication() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-gray-600">Thank you for applying.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 text-black font-sans">
      <div className="w-full max-w-2xl bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Frontend Engineering Intern</h1>
          <p className="text-gray-500 mt-1">TechNova Corp • Remote, US</p>
        </div>

        <form 
          className="p-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input 
                  type="text" 
                  id="first_name" 
                  name="first_name" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input 
                  type="text" 
                  id="last_name" 
                  name="last_name" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Questionnaire</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to work at TechNova Corp? *</label>
              <textarea 
                id="questionnaire_answer" 
                name="questionnaire_answer" 
                rows={5} 
                required 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Minimum 100 words.</p>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              id="submit_button"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
