import type { Person, Worker } from '@/core/types';

const CLOUD = 'https://res.cloudinary.com/dkpfwi4hn/image/upload/';

export const SUPERVISOR: Person = {
  id: 'supervisor',
  name: 'Engr. Tanvir Rahman',
  nameBn: 'প্রকৌ. তানভীর রহমান',
  color: '#2c3330',
};

export const SEED_WORKERS: Worker[] = [
  {
    id: 'w1', name: 'Abdul Karim', nameBn: 'আব্দুল করিম', post: 'foreman', age: 52, dailyRate: 1200, phone: '01711-000001',
    color: '#2f6fb2',
    photo: `${CLOUD}v1794078198/Abdul_Karim_foreman_bdv8tn.jpg`,
  },
  {
    id: 'w2', name: 'Rahim Uddin', nameBn: 'রহিম উদ্দিন', post: 'mason', age: 34, dailyRate: 950, phone: '01711-000002',
    color: '#b83a3a',
    photo: `${CLOUD}v1794079111/Rahim_Uddin_Mason_fikfky.jpg`,
  },
  {
    id: 'w3', name: 'Jamal Hossain', nameBn: 'জামাল হোসেন', post: 'operator', age: 41, dailyRate: 1100, phone: '01711-000003',
    color: '#c95f12',
    photo: `${CLOUD}v1794078169/JamakHossain_MachineOperator_vigw0q.jpg`,
  },
  {
    id: 'w4', name: 'Shafiq Mia', nameBn: 'শফিক মিয়া', post: 'laborer', age: 58, dailyRate: 700, phone: '01711-000004',
    color: '#3f7d31',
  },
  {
    id: 'w5', name: 'Rubel Ahmed', nameBn: 'রুবেল আহমেদ', post: 'roller', age: 29, dailyRate: 1000, phone: '01711-000005',
    color: '#8f6c00',
    photo: `${CLOUD}v1794079556/Rubel_Ahmed_Roller_aw2f2t.jpg`,
  },
  {
    id: 'w6', name: 'Halima Begum', nameBn: 'হালিমা বেগম', post: 'laborer', age: 45, dailyRate: 700, phone: '01711-000006',
    color: '#7b3f98',
    photo: `${CLOUD}v1794078344/HalimaBegum_Labourer_jyctcp.jpg`,
  },
  {
    id: 'w7', name: 'Sumon Das', nameBn: 'সুমন দাস', post: 'helper', age: 22, dailyRate: 600, phone: '01711-000007',
    color: '#137a79',
    photo: `${CLOUD}v1794079111/Sumon_Das_helper_hco2za.jpg`,
  },
  {
    id: 'w8', name: 'Nurul Islam', nameBn: 'নুরুল ইসলাম', post: 'mason', age: 55, dailyRate: 950, phone: '01711-000008',
    color: '#7a5230',
    photo: `${CLOUD}v1794079111/Nurul_Islam_MSON_rpnafd.jpg`,
  },
];
