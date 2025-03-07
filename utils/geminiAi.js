import dotenv from "dotenv";
import axios from 'axios';
dotenv.config();

// Function to call the Gemini API and generate healthcare plan
export const generateHealthPlan = async (patientData) => {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  console.log(GEMINI_API_URL, 'ss');
  try {
    const response = await axios.post(`${GEMINI_API_URL}`, {
      contents: [{
        parts: [{
          text: `Generate a healthcare plan for a patient with the following details in a list view having max 10 bullets points: ${JSON.stringify(patientData)}`
        }]
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
  } catch (error) {
    console.error('Error generating health plan:', error);
    throw new Error('Failed to generate health plan');
  }
};


