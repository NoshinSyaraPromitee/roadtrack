import type { Text } from '@/shared/i18n';
import type { SpeakIssue } from '@/shared/voice';
import type { PhotoProblem } from './photo';
import type { ListenError } from './useListen';

/** Every error Apa can show. Each one says what went wrong, why it happened and how to fix it. */
export type ProblemKey =
  | `photo-${PhotoProblem}`
  | `mic-${ListenError}`
  | 'mic-unsupported'
  | `voice-${SpeakIssue}`
  | 'not-understood'
  | 'data-failed';

export interface Problem {
  title: Text;
  why: Text;
  fix: Text;
  /** Warnings are softer than errors: Apa still answered, just not the best way. */
  tone: 'error' | 'warn';
}

export const PROBLEMS: Record<ProblemKey, Problem> = {
  'photo-missing': {
    tone: 'error',
    title: { en: 'Apa’s picture is missing', bn: 'আপার ছবি পাওয়া যায়নি' },
    why: { en: 'There is no file at public/Apa.jpg. The name must match exactly, with a capital A and .jpg at the end.', bn: 'public/Apa.jpg ঠিকানায় কোনো ফাইল নেই। নাম হুবহু মিলতে হবে: বড় হাতের A, আর শেষে .jpg।' },
    fix: { en: 'Put the picture in D:\\roadtrack\\public and name it Apa.jpg. Then reload the page. On the live site, commit the file and deploy again.', bn: 'ছবিটি D:\\roadtrack\\public ফোল্ডারে রেখে নাম দিন Apa.jpg। তারপর পাতা রিলোড করুন। লাইভ সাইটে ফাইলটি commit করে আবার deploy করুন।' },
  },
  'photo-not-image': {
    tone: 'error',
    title: { en: 'Apa.jpg is not a picture', bn: 'Apa.jpg ছবি নয়' },
    why: { en: 'A file named Apa.jpg exists, but it is some other kind of file, so the browser cannot show it.', bn: 'Apa.jpg নামে একটি ফাইল আছে, কিন্তু সেটি অন্য ধরনের ফাইল, তাই ব্রাউজার দেখাতে পারছে না।' },
    fix: { en: 'Open the picture in Paint or Photos, choose Save as JPEG, name it Apa.jpg and put it in the public folder again.', bn: 'ছবিটি Paint বা Photos-এ খুলে JPEG হিসেবে Save as করুন, নাম Apa.jpg দিন, তারপর আবার public ফোল্ডারে রাখুন।' },
  },
  'photo-broken': {
    tone: 'error',
    title: { en: 'Apa’s picture is damaged', bn: 'আপার ছবি নষ্ট' },
    why: { en: 'The file was found, but the browser could not open it. It may be half-downloaded or saved wrongly.', bn: 'ফাইলটি পাওয়া গেছে, কিন্তু ব্রাউজার খুলতে পারেনি। হয়তো পুরোটা ডাউনলোড হয়নি বা ভুলভাবে সেভ হয়েছে।' },
    fix: { en: 'Download or save the picture again as a JPEG, replace public/Apa.jpg, then reload the page.', bn: 'ছবিটি আবার JPEG হিসেবে ডাউনলোড বা সেভ করুন, public/Apa.jpg বদলে দিন, তারপর পাতা রিলোড করুন।' },
  },
  'photo-offline': {
    tone: 'error',
    title: { en: 'Could not load Apa’s picture', bn: 'আপার ছবি আনা যায়নি' },
    why: { en: 'The page could not reach the server. The internet may be off, or the local server (npm run dev) has stopped.', bn: 'পাতাটি সার্ভারে পৌঁছাতে পারেনি। ইন্টারনেট বন্ধ থাকতে পারে, অথবা লোকাল সার্ভার (npm run dev) বন্ধ হয়ে গেছে।' },
    fix: { en: 'Check the internet or start npm run dev again, then tap Try again.', bn: 'ইন্টারনেট দেখুন বা আবার npm run dev চালু করুন, তারপর "আবার চেষ্টা করুন" চাপুন।' },
  },

  'mic-blocked': {
    tone: 'error',
    title: { en: 'The microphone is blocked', bn: 'মাইক বন্ধ আছে' },
    why: { en: 'This site was not given permission to use the microphone, so Apa cannot hear you.', bn: 'এই সাইটকে মাইক ব্যবহারের অনুমতি দেওয়া হয়নি, তাই আপা আপনার কথা শুনতে পাচ্ছেন না।' },
    fix: { en: 'Tap the lock icon next to the web address, set Microphone to Allow, reload the page and tap the microphone again.', bn: 'ওয়েব ঠিকানার পাশের তালার চিহ্নে চাপ দিন, Microphone-এ Allow দিন, পাতা রিলোড করে আবার মাইকে চাপ দিন।' },
  },
  'mic-service': {
    tone: 'error',
    title: { en: 'This browser does not allow voice questions', bn: 'এই ব্রাউজারে কণ্ঠে প্রশ্ন করা যায় না' },
    why: { en: 'The browser has turned off its speech service for this site. Brave and some privacy settings do this.', bn: 'ব্রাউজার এই সাইটের জন্য কথা বোঝার সেবা বন্ধ রেখেছে। Brave বা কিছু গোপনীয়তা সেটিং এমন করে।' },
    fix: { en: 'Open the site in Google Chrome or Microsoft Edge, or type your question instead.', bn: 'সাইটটি Google Chrome বা Microsoft Edge-এ খুলুন, অথবা প্রশ্নটি লিখে দিন।' },
  },
  'mic-silent': {
    tone: 'warn',
    title: { en: 'I did not hear anything', bn: 'কিছু শুনতে পাইনি' },
    why: { en: 'The microphone was on, but no speech came through. You may have spoken too softly or the microphone is muted.', bn: 'মাইক চালু ছিল, কিন্তু কোনো কথা আসেনি। হয়তো খুব আস্তে বলেছেন, অথবা মাইক মিউট করা।' },
    fix: { en: 'Hold the phone closer, check the microphone is not muted, tap the microphone and speak again.', bn: 'ফোন মুখের কাছে ধরুন, মাইক মিউট নয় কিনা দেখুন, তারপর মাইকে চাপ দিয়ে আবার বলুন।' },
  },
  'mic-no-mic': {
    tone: 'error',
    title: { en: 'No microphone found', bn: 'কোনো মাইক পাওয়া যায়নি' },
    why: { en: 'The device has no working microphone, or another app is using it right now.', bn: 'ডিভাইসে চালু কোনো মাইক নেই, অথবা অন্য একটি অ্যাপ এখন মাইক ব্যবহার করছে।' },
    fix: { en: 'Plug in a headset or close apps like calls or recorders that use the microphone, then try again.', bn: 'হেডসেট লাগান, অথবা কল বা রেকর্ডারের মতো যে অ্যাপ মাইক ব্যবহার করছে তা বন্ধ করে আবার চেষ্টা করুন।' },
  },
  'mic-network': {
    tone: 'error',
    title: { en: 'Voice questions need the internet', bn: 'কণ্ঠে প্রশ্নের জন্য ইন্টারনেট লাগে' },
    why: { en: 'The browser sends your voice to its speech service to understand it, and it could not reach it.', bn: 'কথা বুঝতে ব্রাউজার আপনার কণ্ঠ তার সেবায় পাঠায়, কিন্তু সেখানে পৌঁছাতে পারেনি।' },
    fix: { en: 'Turn on mobile data or Wi-Fi and try again. Without internet, tap a question or type it.', bn: 'মোবাইল ডেটা বা ওয়াই-ফাই চালু করে আবার চেষ্টা করুন। ইন্টারনেট না থাকলে একটি প্রশ্নে চাপ দিন বা লিখুন।' },
  },
  'mic-language': {
    tone: 'error',
    title: { en: 'This browser cannot understand Bangla speech', bn: 'এই ব্রাউজার বাংলা কথা বুঝতে পারে না' },
    why: { en: 'The speech service in this browser has no Bangla.', bn: 'এই ব্রাউজারের কথা বোঝার সেবায় বাংলা নেই।' },
    fix: { en: 'Use Google Chrome on Android, switch the app to English, or type your question.', bn: 'Android-এ Google Chrome ব্যবহার করুন, অ্যাপটি English-এ বদলান, অথবা প্রশ্নটি লিখুন।' },
  },
  'mic-busy': {
    tone: 'warn',
    title: { en: 'Listening could not start', bn: 'শোনা শুরু করা যায়নি' },
    why: { en: 'The browser was still busy with the last recording, or the "Apa" voice call was listening at the same time.', bn: 'ব্রাউজার আগের রেকর্ডিং নিয়ে ব্যস্ত ছিল, অথবা একই সময়ে "আপা" ডাক শুনছিল।' },
    fix: { en: 'Wait two seconds and tap the microphone again.', bn: 'দুই সেকেন্ড অপেক্ষা করে আবার মাইকে চাপ দিন।' },
  },
  'mic-failed': {
    tone: 'error',
    title: { en: 'Listening stopped with an error', bn: 'শুনতে গিয়ে সমস্যা হয়েছে' },
    why: { en: 'The browser’s speech service stopped without saying why.', bn: 'ব্রাউজারের কথা বোঝার সেবা কারণ না জানিয়ে থেমে গেছে।' },
    fix: { en: 'Reload the page and try again. If it keeps happening, type your question or tap one below.', bn: 'পাতা রিলোড করে আবার চেষ্টা করুন। বারবার হলে প্রশ্নটি লিখুন বা নিচের একটিতে চাপ দিন।' },
  },
  'mic-unsupported': {
    tone: 'warn',
    title: { en: 'Voice questions do not work in this browser', bn: 'এই ব্রাউজারে কণ্ঠে প্রশ্ন করা যায় না' },
    why: { en: 'This browser (for example Firefox) has no speech recognition.', bn: 'এই ব্রাউজারে (যেমন Firefox) কথা বোঝার ব্যবস্থা নেই।' },
    fix: { en: 'Open the site in Google Chrome or Microsoft Edge to speak. Here, tap a question or type it.', bn: 'কথা বলতে সাইটটি Google Chrome বা Microsoft Edge-এ খুলুন। এখানে একটি প্রশ্নে চাপ দিন বা লিখুন।' },
  },

  'voice-unsupported': {
    tone: 'error',
    title: { en: 'This browser cannot read aloud', bn: 'এই ব্রাউজার পড়ে শোনাতে পারে না' },
    why: { en: 'The browser has no text-to-speech.', bn: 'ব্রাউজারে লেখা পড়ে শোনানোর ব্যবস্থা নেই।' },
    fix: { en: 'Use Google Chrome or Microsoft Edge. The answers are still written on screen.', bn: 'Google Chrome বা Microsoft Edge ব্যবহার করুন। উত্তর তবুও পর্দায় লেখা থাকবে।' },
  },
  'voice-bn-offline': {
    tone: 'warn',
    title: { en: 'Read in English, not Bangla', bn: 'বাংলার বদলে ইংরেজিতে পড়া হলো' },
    why: { en: 'This device has no Bangla voice, and there is no internet for the online Bangla voice.', bn: 'এই ডিভাইসে বাংলা কণ্ঠ নেই, আর অনলাইন বাংলা কণ্ঠের জন্য ইন্টারনেটও নেই।' },
    fix: { en: 'Turn on the internet, or install a Bangla voice: phone Settings → Text-to-speech → Google → Install voice data → Bangla.', bn: 'ইন্টারনেট চালু করুন, অথবা বাংলা কণ্ঠ ইনস্টল করুন: ফোনের Settings → Text-to-speech → Google → Install voice data → Bangla।' },
  },
  'voice-bn-online-failed': {
    tone: 'warn',
    title: { en: 'Read in English, not Bangla', bn: 'বাংলার বদলে ইংরেজিতে পড়া হলো' },
    why: { en: 'This device has no Bangla voice, and the online Bangla voice could not be reached. The network may be slow or blocking it.', bn: 'এই ডিভাইসে বাংলা কণ্ঠ নেই, আর অনলাইন বাংলা কণ্ঠে পৌঁছানো যায়নি। নেটওয়ার্ক ধীর বা বন্ধ থাকতে পারে।' },
    fix: { en: 'Try again on a better connection, or install a Bangla voice: phone Settings → Text-to-speech → Google → Install voice data → Bangla. On Windows, use Microsoft Edge.', bn: 'ভালো নেটওয়ার্কে আবার চেষ্টা করুন, অথবা বাংলা কণ্ঠ ইনস্টল করুন: ফোনের Settings → Text-to-speech → Google → Install voice data → Bangla। Windows-এ Microsoft Edge ব্যবহার করুন।' },
  },
  'voice-blocked': {
    tone: 'warn',
    title: { en: 'The browser blocked the sound', bn: 'ব্রাউজার আওয়াজ আটকে দিয়েছে' },
    why: { en: 'Browsers do not play sound until you tap the page once.', bn: 'পাতায় একবার না চাপা পর্যন্ত ব্রাউজার আওয়াজ চালায় না।' },
    fix: { en: 'Tap the speaker button next to the answer to hear it. Also check the phone is not on silent.', bn: 'উত্তরের পাশের স্পিকার বোতামে চাপ দিয়ে শুনুন। ফোন সাইলেন্টে আছে কিনা দেখুন।' },
  },
  'voice-failed': {
    tone: 'warn',
    title: { en: 'Could not read the answer aloud', bn: 'উত্তর পড়ে শোনানো যায়নি' },
    why: { en: 'The device voice stopped with an error. Another app may be playing sound, or the voice is still downloading.', bn: 'ডিভাইসের কণ্ঠ সমস্যায় থেমে গেছে। অন্য অ্যাপে আওয়াজ চলছে, অথবা কণ্ঠ এখনো ডাউনলোড হচ্ছে।' },
    fix: { en: 'Stop other sound, wait a moment and tap the speaker button again.', bn: 'অন্য আওয়াজ বন্ধ করুন, একটু অপেক্ষা করে আবার স্পিকার বোতামে চাপ দিন।' },
  },

  'not-understood': {
    tone: 'warn',
    title: { en: 'I did not understand', bn: 'বুঝতে পারিনি' },
    why: { en: 'Apa works without internet, so she only knows the questions below. Your words did not match any of them.', bn: 'আপা ইন্টারনেট ছাড়া চলে, তাই শুধু নিচের প্রশ্নগুলো জানে। আপনার কথা কোনোটির সাথে মেলেনি।' },
    fix: { en: 'Tap a question below, or use a key word like money, break, sick, complaint or road.', bn: 'নিচের একটি প্রশ্নে চাপ দিন, অথবা টাকা, বিরতি, অসুস্থ, অভিযোগ বা রাস্তা এমন একটি শব্দ বলুন।' },
  },
  'data-failed': {
    tone: 'error',
    title: { en: 'Apa could not read the app’s data', bn: 'আপা অ্যাপের তথ্য পড়তে পারেনি' },
    why: { en: 'The data saved in this browser is from an older version of the app or is damaged.', bn: 'এই ব্রাউজারে রাখা তথ্য অ্যাপের পুরনো সংস্করণের, অথবা নষ্ট হয়ে গেছে।' },
    fix: { en: 'Tap the round arrow at the top of the page to clear the saved data and start again.', bn: 'সংরক্ষিত তথ্য মুছে আবার শুরু করতে পাতার উপরের গোল তীরে চাপ দিন।' },
  },
};
