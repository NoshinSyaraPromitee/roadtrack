import { canHash, normalizePhone } from '@/core/accounts';
import type { I18n, Text } from '@/shared/i18n';

export type Problem = { why: Text; fix: Text };

export const MAX_TRIES = 5;
export const LOCK_MS = 30_000;

export function inputProblem(phone: string, password: string, i: I18n): Problem | null {
  const digits = normalizePhone(phone);
  if (!digits) {
    return { why: { en: 'The phone number is empty.', bn: 'ফোন নম্বর লেখা হয়নি।' }, fix: { en: 'Write the phone number the office gave you.', bn: 'অফিস যে ফোন নম্বর দিয়েছে তা লিখুন।' } };
  }
  if (digits.length !== 11 || !digits.startsWith('01')) {
    return {
      why: { en: `A Bangladeshi mobile number has 11 digits and starts with 01. This one has ${digits.length}.`, bn: `বাংলাদেশের মোবাইল নম্বর ১১ অঙ্কের, শুরু হয় ০১ দিয়ে। এখানে ${i.num(digits.length)}টি অঙ্ক আছে।` },
      fix: { en: 'Check the number and write all 11 digits.', bn: 'নম্বরটি আবার দেখে ১১টি অঙ্কই লিখুন।' },
    };
  }
  if (!password) {
    return { why: { en: 'The password is empty.', bn: 'পাসওয়ার্ড লেখা হয়নি।' }, fix: { en: 'Write your password.', bn: 'আপনার পাসওয়ার্ড লিখুন।' } };
  }
  if (!canHash()) {
    return {
      why: { en: 'This page was opened without https, so the browser turns off the safe password check.', bn: 'পাতাটি https ছাড়া খোলা হয়েছে, তাই ব্রাউজার নিরাপদ পাসওয়ার্ড যাচাই বন্ধ রেখেছে।' },
      fix: { en: 'Open the site with an https:// address, or on this computer at localhost.', bn: 'সাইটটি https:// ঠিকানা দিয়ে খুলুন, অথবা এই কম্পিউটারে localhost দিয়ে খুলুন।' },
    };
  }
  return null;
}

export const lockedProblem = (i: I18n): Problem => ({
  why: { en: `The phone number or password was wrong ${MAX_TRIES} times.`, bn: `ফোন নম্বর বা পাসওয়ার্ড ${i.num(MAX_TRIES)} বার ভুল হয়েছে।` },
  fix: { en: 'Wait 30 seconds and try again, or tap "Forgot password?" to set a new one.', bn: '৩০ সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন, অথবা নতুন পাসওয়ার্ড দিতে "পাসওয়ার্ড ভুলে গেছেন?" চাপুন।' },
});

export const wrongProblem = (left: number, i: I18n): Problem => ({
  why: { en: 'The phone number or the password does not match.', bn: 'ফোন নম্বর বা পাসওয়ার্ড মেলেনি।' },
  fix: {
    en: `Check both and try again. Capital and small letters count in the password. ${left} tries left.`,
    bn: `দুটোই আবার দেখে লিখুন। পাসওয়ার্ডে বড় আর ছোট হাতের অক্ষর আলাদা ধরা হয়। আর ${i.num(left)} বার চেষ্টা করতে পারবেন।`,
  },
});

export const CHECK_FAILED: Problem = {
  why: { en: 'The browser could not check the password.', bn: 'ব্রাউজার পাসওয়ার্ড যাচাই করতে পারেনি।' },
  fix: { en: 'Reload the page and try again. If it keeps happening, use Google Chrome or Microsoft Edge.', bn: 'পাতা রিলোড করে আবার চেষ্টা করুন। বারবার হলে Google Chrome বা Microsoft Edge ব্যবহার করুন।' },
};

export const waitingProblem = (pending: boolean): Problem =>
  pending
    ? {
        why: { en: 'Your registration is waiting for head office approval.', bn: 'আপনার নিবন্ধন প্রধান কার্যালয়ের অনুমোদনের অপেক্ষায় আছে।' },
        fix: { en: 'You can sign in as soon as head office approves it.', bn: 'প্রধান কার্যালয় অনুমোদন দিলেই সাইন ইন করতে পারবেন।' },
      }
    : {
        why: { en: 'Head office did not approve this registration.', bn: 'প্রধান কার্যালয় এই নিবন্ধন অনুমোদন করেনি।' },
        fix: { en: 'Call the head office, or register again with the right trade licence.', bn: 'প্রধান কার্যালয়ে ফোন করুন, অথবা সঠিক ট্রেড লাইসেন্স দিয়ে আবার নিবন্ধন করুন।' },
      };
