import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "login": {
        "welcome": "Welcome to Farm Connect",
        "enter_details": "Enter your details to continue",
        "full_name": "Full Name",
        "name_placeholder": "Enter your full name",
        "mobile_number": "Mobile Number",
        "mobile_placeholder": "Enter your 10-digit mobile number",
        "select_role": "Select Role",
        "work_laborer": "Work as Laborer",
        "find_work": "Find farm work",
        "hire_laborers": "Hire Laborers",
        "find_workers": "Find workers for your farm",
        "continue": "Continue",
        "processing": "Processing...",
        "detecting_location": "Detecting Location",
        "location_desc": "We need your location to show you relevant farm work and laborers in your area.",
        "allow_location": "Please allow location access when prompted by your browser...",
        "detecting": "Detecting...",
        "try_again": "Try Again",
        "skip_for_now": "Skip for now",
        "error_phone": "Please enter a valid 10-digit Indian mobile number.",
        "error_name": "Please enter your full name.",
        "error_role": "Please select a role.",
        "loc_error_unsupported": "Geolocation is not supported by your browser.",
        "loc_error_denied": "Location permission denied or unavailable.",
        "loc_error_resolve": "Could not resolve your location details."
      },
      "app": {
        "title": "Farm Connect"
      },
      "laborer_dash": {
        "hi": "Hi",
        "laborer": "Laborer",
        "dashboard_title": "Laborer Dashboard",
        "direct_booking": "Direct Booking Request",
        "from": "From",
        "reject": "Reject",
        "accept": "Accept",
        "available_q": "Are you available to work tomorrow?",
        "let_owners_know": "Let farm owners know your availability",
        "up_hand": "👍 UP HAND",
        "yes_available": "Yes, I can work tomorrow",
        "down_hand": "👎 DOWN HAND",
        "no_available": "No, I am not available tomorrow",
        "not_available_title": "Not Available Tomorrow",
        "not_available_desc": "Farm owners have been notified that you are taking tomorrow off.",
        "change_availability": "Change Availability",
        "status_available": "Status: Available Tomorrow",
        "change": "Change",
        "tomorrows_work": "Tomorrow's Work",
        "jobs_available": "Jobs available for tomorrow",
        "no_jobs": "No more available jobs for tomorrow.",
        "new_alerts": "New work alerts from farm owners will appear here.",
        "owner": "Owner",
        "work": "Work",
        "accepted": "Accepted",
        "call_owner": "Call Owner"
      },
      "owner_dash": {
        "hire_laborers": "Hire Laborers",
        "farm_owner": "Farm Owner",
        "laborers": "Laborers",
        "notifications": "Notifications",
        "post_job": "Post Job",
        "bookings": "Bookings"
      }
    }
  },
  hi: {
    translation: {
      "login": {
        "welcome": "फार्म कनेक्ट में आपका स्वागत है",
        "enter_details": "जारी रखने के लिए अपना विवरण दर्ज करें",
        "full_name": "पूरा नाम",
        "name_placeholder": "अपना पूरा नाम दर्ज करें",
        "mobile_number": "मोबाइल नंबर",
        "mobile_placeholder": "अपना 10 अंकों का मोबाइल नंबर दर्ज करें",
        "select_role": "भूमिका चुनें",
        "work_laborer": "मजदूर के रूप में काम करें",
        "find_work": "खेत का काम खोजें",
        "hire_laborers": "मजदूर किराए पर लें",
        "find_workers": "अपने खेत के लिए मजदूर खोजें",
        "continue": "जारी रखें",
        "processing": "संसाधित कर रहा है...",
        "detecting_location": "स्थान का पता लगाया जा रहा है",
        "location_desc": "हमें आपके क्षेत्र में प्रासंगिक खेत के काम और मजदूरों को दिखाने के लिए आपके स्थान की आवश्यकता है।",
        "allow_location": "कृपया अपने ब्राउज़र द्वारा संकेत दिए जाने पर स्थान पहुंच की अनुमति दें...",
        "detecting": "पता लगाया जा रहा है...",
        "try_again": "पुनः प्रयास करें",
        "skip_for_now": "अभी छोड़ें",
        "error_phone": "कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।",
        "error_name": "कृपया अपना पूरा नाम दर्ज करें।",
        "error_role": "कृपया एक भूमिका चुनें।",
        "loc_error_unsupported": "जियोलोकेशन आपके ब्राउज़र द्वारा समर्थित नहीं है।",
        "loc_error_denied": "स्थान की अनुमति अस्वीकृत या अनुपलब्ध है।",
        "loc_error_resolve": "आपके स्थान विवरण का समाधान नहीं किया जा सका।"
      },
      "app": {
        "title": "फार्म कनेक्ट"
      },
      "laborer_dash": {
        "hi": "नमस्ते",
        "laborer": "मजदूर",
        "dashboard_title": "मजदूर डैशबोर्ड",
        "direct_booking": "सीधा बुकिंग अनुरोध",
        "from": "से",
        "reject": "अस्वीकार",
        "accept": "स्वीकार",
        "available_q": "क्या आप कल काम करने के लिए उपलब्ध हैं?",
        "let_owners_know": "खेत मालिकों को अपनी उपलब्धता बताएं",
        "up_hand": "👍 हाँ",
        "yes_available": "हाँ, मैं कल काम कर सकता हूँ",
        "down_hand": "👎 नहीं",
        "no_available": "नहीं, मैं कल उपलब्ध नहीं हूँ",
        "not_available_title": "कल उपलब्ध नहीं है",
        "not_available_desc": "खेत मालिकों को सूचित कर दिया गया है कि आप कल छुट्टी ले रहे हैं।",
        "change_availability": "उपलब्धता बदलें",
        "status_available": "स्थिति: कल उपलब्ध है",
        "change": "बदलें",
        "tomorrows_work": "कल का काम",
        "jobs_available": "कल के लिए उपलब्ध नौकरियां",
        "no_jobs": "कल के लिए कोई और उपलब्ध नौकरी नहीं है।",
        "new_alerts": "खेत मालिकों से नए कार्य अलर्ट यहां दिखाई देंगे।",
        "owner": "मालिक",
        "work": "काम",
        "accepted": "स्वीकार किया",
        "call_owner": "मालिक को कॉल करें"
      },
      "owner_dash": {
        "hire_laborers": "मजदूर किराए पर लें",
        "farm_owner": "खेत का मालिक",
        "laborers": "मजदूर",
        "notifications": "सूचनाएं",
        "post_job": "नौकरी पोस्ट करें",
        "bookings": "बुकिंग"
      }
    }
  },
  kn: {
    translation: {
      "login": {
        "welcome": "ಫಾರ್ಮ್ ಕನೆಕ್ಟ್‌ಗೆ ಸುಸ್ವಾಗತ",
        "enter_details": "ಮುಂದುವರೆಯಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
        "full_name": "ಪೂರ್ಣ ಹೆಸರು",
        "name_placeholder": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
        "mobile_number": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
        "mobile_placeholder": "ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
        "select_role": "ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        "work_laborer": "ಕಾರ್ಮಿಕನಾಗಿ ಕೆಲಸ ಮಾಡಿ",
        "find_work": "ಕೃಷಿ ಕೆಲಸವನ್ನು ಹುಡುಕಿ",
        "hire_laborers": "ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಿ",
        "find_workers": "ನಿಮ್ಮ ಹೊಲಕ್ಕಾಗಿ ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ",
        "continue": "ಮುಂದುವರಿಸಿ",
        "processing": "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
        "detecting_location": "ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ",
        "location_desc": "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿನ ಕೃಷಿ ಕೆಲಸ ಮತ್ತು ಕಾರ್ಮಿಕರನ್ನು ನಿಮಗೆ ತೋರಿಸಲು ನಮಗೆ ನಿಮ್ಮ ಸ್ಥಳದ ಅಗತ್ಯವಿದೆ.",
        "allow_location": "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಪ್ರೇರೇಪಿಸಿದಾಗ ದಯವಿಟ್ಟು ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ...",
        "detecting": "ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
        "try_again": "ಪುನಃ ಪ್ರಯತ್ನಿಸಿ",
        "skip_for_now": "ಈಗ ಬಿಟ್ಟುಬಿಡಿ",
        "error_phone": "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
        "error_name": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
        "error_role": "ದಯವಿಟ್ಟು ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        "loc_error_unsupported": "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಿಂದ ಜಿಯೋಲೋಕಲೈಸೇಶನ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",
        "loc_error_denied": "ಸ್ಥಳ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ ಅಥವಾ ಲಭ್ಯವಿಲ್ಲ.",
        "loc_error_resolve": "ನಿಮ್ಮ ಸ್ಥಳ ವಿವರಗಳನ್ನು ಪರಿಹರಿಸಲಾಗಲಿಲ್ಲ."
      },
      "app": {
        "title": "ಫಾರ್ಮ್ ಕನೆಕ್ಟ್"
      },
      "laborer_dash": {
        "hi": "ಹಾಯ್",
        "laborer": "ಕಾರ್ಮಿಕ",
        "dashboard_title": "ಕಾರ್ಮಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        "direct_booking": "ನೇರ ಬುಕಿಂಗ್ ವಿನಂತಿ",
        "from": "ಇಂದ",
        "reject": "ತಿರಸ್ಕರಿಸಿ",
        "accept": "ಸ್ವೀಕರಿಸಿ",
        "available_q": "ನೀವು ನಾಳೆ ಕೆಲಸ ಮಾಡಲು ಲಭ್ಯವಿದ್ದೀರಾ?",
        "let_owners_know": "ನಿಮ್ಮ ಲಭ್ಯತೆಯನ್ನು ಕೃಷಿ ಮಾಲೀಕರಿಗೆ ತಿಳಿಸಿ",
        "up_hand": "👍 ಹೌದು",
        "yes_available": "ಹೌದು, ನಾನು ನಾಳೆ ಕೆಲಸ ಮಾಡಬಹುದು",
        "down_hand": "👎 ಇಲ್ಲ",
        "no_available": "ಇಲ್ಲ, ನಾನು ನಾಳೆ ಲಭ್ಯವಿಲ್ಲ",
        "not_available_title": "ನಾಳೆ ಲಭ್ಯವಿಲ್ಲ",
        "not_available_desc": "ನೀವು ನಾಳೆ ರಜೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ ಎಂದು ಕೃಷಿ ಮಾಲೀಕರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.",
        "change_availability": "ಲಭ್ಯತೆಯನ್ನು ಬದಲಾಯಿಸಿ",
        "status_available": "ಸ್ಥಿತಿ: ನಾಳೆ ಲಭ್ಯವಿದೆ",
        "change": "ಬದಲಾಯಿಸಿ",
        "tomorrows_work": "ನಾಳಿನ ಕೆಲಸ",
        "jobs_available": "ನಾಳೆಗೆ ಲಭ್ಯವಿರುವ ಉದ್ಯೋಗಗಳು",
        "no_jobs": "ನಾಳೆಗೆ ಇನ್ನು ಯಾವುದೇ ಉದ್ಯೋಗಗಳಿಲ್ಲ.",
        "new_alerts": "ಕೃಷಿ ಮಾಲೀಕರಿಂದ ಹೊಸ ಕಾರ್ಯ ಎಚ್ಚರಿಕೆಗಳು ಇಲ್ಲಿ ಗೋಚರಿಸುತ್ತವೆ.",
        "owner": "ಮಾಲೀಕರು",
        "work": "ಕೆಲಸ",
        "accepted": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
        "call_owner": "ಮಾಲೀಕರಿಗೆ ಕರೆ ಮಾಡಿ"
      },
      "owner_dash": {
        "hire_laborers": "ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಿ",
        "farm_owner": "ಕೃಷಿ ಮಾಲೀಕರು",
        "laborers": "ಕಾರ್ಮಿಕರು",
        "notifications": "ಅಧಿಸೂಚನೆಗಳು",
        "post_job": "ಉದ್ಯೋಗವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ",
        "bookings": "ಬುಕಿಂಗ್‌ಗಳು"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
