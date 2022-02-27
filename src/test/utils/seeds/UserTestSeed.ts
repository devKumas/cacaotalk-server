import { Gender } from '../../../dtos/UserDto';

export const userSeed = [
  {
    email: 'user1@kumas.dev',
    password: '$2b$10$x5c0a2TleYXjq5iWk2fsuueKVrdrG7eAvTUIMznloGNfJL4QIGmum',
    name: '흥부',
    gender: Gender.M,
  },
  {
    email: 'user2@kumas.dev',
    password: '$2b$10$x5c0a2TleYXjq5iWk2fsuueKVrdrG7eAvTUIMznloGNfJL4QIGmum',
    name: '놀부',
    gender: Gender.M,
  },
];
