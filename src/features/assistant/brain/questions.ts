import { Coffee, Construction, Flag, HandCoins, HeartHandshake, HeartPulse, Info, Megaphone, MessageCircleQuestion, Play, Stethoscope, Trash2, Tractor, TrendingUp, Wallet, CircleHelp, BadgeCheck } from 'lucide-react';
import type { QuestionDef, QuestionKey } from './types';

export const QUESTIONS: Record<QuestionKey, QuestionDef> = {
  my_pay: {
    icon: Wallet,
    label: { en: 'How much did I earn?', bn: 'আমি কত টাকা পেয়েছি?' },
    words: ['earn', 'money', 'paid', 'income', 'how much', 'salary', 'টাকা', 'আয়', 'পেয়েছি', 'পেলাম', 'কত টাকা', 'মজুরি কত', 'টাকা পাব'],
  },
  daily_rate: {
    icon: HandCoins,
    label: { en: 'What is my daily pay?', bn: 'আমার দৈনিক মজুরি কত?' },
    words: ['daily', 'daily pay', 'per day', 'rate', 'a day', 'দৈনিক', 'দৈনিক মজুরি', 'রোজ', 'প্রতিদিন', 'হাজিরা'],
  },
  raise: {
    icon: TrendingUp,
    label: { en: 'Is my raise approved?', bn: 'আমার বেতন বাড়ল কি?' },
    labelBy: { admin: { en: 'Any raise requests?', bn: 'বেতন বৃদ্ধির আবেদন আছে?' } },
    words: ['raise', 'increase', 'more pay', 'hike', 'বাড়', 'বৃদ্ধি', 'বাড়ানো', 'বাড়াতে'],
  },
  complaints: {
    icon: Megaphone,
    label: { en: 'What happened to my complaint?', bn: 'আমার অভিযোগের কী হলো?' },
    labelBy: { admin: { en: 'How many complaints are open?', bn: 'কতগুলো অভিযোগ বাকি?' } },
    words: ['complaint', 'complain', 'problem', 'অভিযোগ', 'নালিশ', 'সমস্যা'],
  },
  next_break: {
    icon: Coffee,
    label: { en: 'When is the next break?', bn: 'পরের বিরতি কখন?' },
    words: ['break', 'rest', 'snack', 'tea', 'lunch', 'tired', 'বিরতি', 'বিশ্রাম', 'নাস্তা', 'চা', 'খাবার', 'ক্লান্ত'],
  },
  extra_pay: {
    icon: HeartHandshake,
    label: { en: 'Who gets extra pay?', bn: 'কারা বাড়তি টাকা পান?' },
    words: ['extra', 'bonus', 'old', 'sick', 'hurt', 'cut', 'বাড়তি', 'বোনাস', 'বয়স্ক', 'অসুস্থ', 'আহত', 'কাটা'],
  },
  how_complain: {
    icon: MessageCircleQuestion,
    label: { en: 'How do I complain?', bn: 'কীভাবে অভিযোগ করব?' },
    words: ['how to complain', 'how do i complain', 'make a complaint', 'কীভাবে অভিযোগ', 'কিভাবে অভিযোগ', 'অভিযোগ করব', 'অভিযোগ করতে'],
  },
  shift_now: {
    icon: Construction,
    label: { en: "How is today's work going?", bn: 'আজকের কাজ কেমন চলছে?' },
    words: ['today', 'shift', 'working', 'site', 'on site', 'আজ', 'শিফট', 'কাজ চলছে', 'সাইট', 'কতজন'],
  },
  how_start: {
    icon: Play,
    label: { en: 'How do I start work?', bn: 'কাজ কীভাবে শুরু করব?' },
    words: ['start', 'begin', 'শুরু'],
  },
  how_finish: {
    icon: Flag,
    label: { en: 'How do I finish the shift?', bn: 'শিফট কীভাবে শেষ করব?' },
    words: ['finish', 'end', 'close', 'done for', 'শেষ'],
  },
  crew_care: {
    icon: HeartPulse,
    label: { en: 'Who needs extra care?', bn: 'কার বেশি খেয়াল রাখতে হবে?' },
    words: ['care', 'elder', 'older', 'who needs', 'safety', 'খেয়াল', 'যত্ন', 'বয়স্ক', 'নিরাপত্তা'],
  },
  progress: {
    icon: Construction,
    label: { en: 'How much road is done?', bn: 'রাস্তার কতটা হয়েছে?' },
    words: ['progress', 'road', 'percent', 'km', 'kilometre', 'how far', 'অগ্রগতি', 'রাস্তা', 'কতটা', 'কিলোমিটার'],
  },
  pay_pending: {
    icon: BadgeCheck,
    label: { en: 'Any pay to approve?', bn: 'অনুমোদনের মজুরি আছে?' },
    words: ['approve', 'approval', 'pay list', 'payroll', 'wage', 'অনুমোদন', 'মজুরির তালিকা', 'মজুরি'],
  },
  waste: {
    icon: Trash2,
    label: { en: 'How much was wasted?', bn: 'কতটা মাল নষ্ট হয়েছে?' },
    words: ['waste', 'wasted', 'loss', 'material', 'নষ্ট', 'অপচয়', 'মাল', 'মালামাল'],
  },
  help: {
    icon: CircleHelp,
    label: { en: 'What can I do here?', bn: 'এখানে কী কী করা যায়?' },
    words: ['help', 'how to use', 'what can', 'tab', 'সাহায্য', 'কী করা যায়', 'কীভাবে', 'কিভাবে', 'ব্যবহার'],
  },
  machines: {
    icon: Tractor,
    label: { en: 'Are the machines working?', bn: 'মেশিনগুলো চলছে তো?' },
    words: ['machine', 'machines', 'roller', 'truck', 'fuel', 'diesel', 'broken', 'excavator', 'মেশিন', 'রোলার', 'ট্রাক', 'জ্বালানি', 'তেল', 'নষ্ট মেশিন'],
  },
  health: {
    icon: Stethoscope,
    label: { en: 'How do I tell I am sick?', bn: 'অসুস্থ হলে কীভাবে জানাব?' },
    labelBy: {
      supervisor: { en: 'Is anyone sick today?', bn: 'আজ কেউ অসুস্থ?' },
      admin: { en: 'Is anyone sick today?', bn: 'আজ কেউ অসুস্থ?' },
    },
    words: ['sick', 'ill', 'fever', 'health', 'hurt', 'unwell', 'অসুস্থ', 'জ্বর', 'শরীর', 'স্বাস্থ্য', 'আহত', 'অসুখ', 'ব্যথা'],
  },
  intro: {
    icon: Info,
    label: { en: 'Who are you?', bn: 'আপনি কে?' },
    words: ['who are you', 'your name', 'hello', 'apa', 'আপনি কে', 'তুমি কে', 'আপনার নাম', 'হ্যালো', 'আপা', 'সালাম'],
  },
};
