import dotenv from "dotenv";
import axios from 'axios';
dotenv.config();

console.log("GOOGLE_TRANSLATE_API_KEY:", process.env.GOOGLE_TRANSLATE_API_KEY);

export const translatePatientNotes = async (notes, language) => {
    console.log('notes', notes, language)
    
    const GOOGLE_TRANSLATE_API_URL = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;

    try {
        
        const response = await axios.post(GOOGLE_TRANSLATE_API_URL, {
            q: notes, 
            target: language
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const translatedText = response.data.data.translations[0].translatedText;
        console.log(translatedText);
        // return response.data.data.translations[0].translatedText;
        return response.data;
    } catch (error) {
        console.error('Error translating:', error?.response?.data || error.message);
        throw new Error('Failed to translate patient notes');
    }
};
