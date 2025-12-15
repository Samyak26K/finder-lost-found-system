import { Category, Item, ItemStatus, ItemType, User, UserRole } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Student',
  email: 'alex@college.edu',
  role: UserRole.USER,
  avatar: 'https://picsum.photos/seed/alex/100/100'
};

export const ADMIN_USER: User = {
  id: 'a1',
  name: 'Campus Security',
  email: 'admin@college.edu',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/100/100'
};

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    type: ItemType.LOST,
    title: 'Silver MacBook Pro 14"',
    category: Category.ELECTRONICS,
    description: 'Left it in the library study room 3B. Has a sticker of a cat on the lid.',
    location: 'Main Library',
    date: TODAY,
    status: ItemStatus.REPORTED,
    reporterId: 'u1',
    imageUrl: 'https://picsum.photos/seed/macbook/300/200'
  },
  {
    id: '2',
    type: ItemType.FOUND,
    title: 'Grey Apple Laptop',
    category: Category.ELECTRONICS,
    description: 'Found near the study rooms. Locked.',
    location: 'Main Library',
    date: TODAY,
    status: ItemStatus.REPORTED,
    reporterId: 'u2', // Another user
    imageUrl: 'https://picsum.photos/seed/laptop/300/200'
  },
  {
    id: '3',
    type: ItemType.LOST,
    title: 'Blue Hydroflask',
    category: Category.OTHER,
    description: 'Dented on the bottom, has a climbing sticker.',
    location: 'Gym',
    date: YESTERDAY,
    status: ItemStatus.RESOLVED,
    reporterId: 'u1'
  },
  {
    id: '4',
    type: ItemType.FOUND,
    title: 'Car Keys (Toyota)',
    category: Category.KEYS,
    description: 'Found in the parking lot B.',
    location: 'Parking Lot B',
    date: YESTERDAY,
    status: ItemStatus.UNDER_REVIEW,
    reporterId: 'u3'
  },
  {
    id: '5',
    type: ItemType.LOST,
    title: 'Black Leather Wallet',
    category: Category.ACCESSORIES,
    description: 'Contains ID for John Doe. Lost near cafeteria.',
    location: 'Cafeteria',
    date: TODAY,
    status: ItemStatus.REPORTED,
    reporterId: 'u4'
  }
];