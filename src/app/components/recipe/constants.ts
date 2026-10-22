import type { Comment } from './types';

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const COLORS = {
  primary: '#FFFBF5',
  secondary: '#2D3E2C',
  accent: '#E8762F',
  text: '#1F2420',
  textMuted: '#6B7269',
  white: '#FFFFFF',
  border: '#E5E5E0',
  borderLight: '#E0E0E0',
} as const;

export const FONTS = {
  heading: 'Playfair Display, serif',
  body: 'Inter, sans-serif',
} as const;

// ─── Content Policy ───────────────────────────────────────────────────────────

/** Single source of truth for banned words — used by useComments. */
export const BANNED_WORDS = [
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'hate',
] as const;

export type BannedWord = typeof BANNED_WORDS[number];

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const RECIPE_NAMES: readonly string[] = [
  'Apple Pie', 'Beef Wellington', 'Caesar Salad', 'Duck Confit', 'Eggs Benedict',
  'French Onion Soup', 'Grilled Salmon', 'Honey Glazed Ham', 'Italian Risotto', 'Japanese Ramen',
  'Key Lime Pie', 'Lobster Thermidor', 'Mushroom Soup', 'New York Cheesecake', 'Orange Chicken',
  'Pad Thai', 'Quinoa Bowl', 'Roast Chicken', 'Spaghetti Carbonara', 'Tiramisu',
  'Vegetable Curry', 'Waffles', 'Chocolate Cake', 'Beef Tacos', 'Chicken Tikka Masala',
  'Greek Salad', 'Margherita Pizza', 'Pancakes', 'Sushi Rolls', 'Turkey Sandwich',
  'Vanilla Ice Cream', 'Avocado Toast', 'Blueberry Muffins', 'Chicken Soup', 'Fish Tacos',
  'Garlic Bread', 'Hummus', 'Lasagna', 'Miso Soup', 'Pesto Pasta',
  'Chocolate Mousse', 'Croissant', 'Eggs Florentine', 'French Toast', 'Gnocchi',
  'Beef Stew', 'Chicken Parmesan', 'Clam Chowder', 'Crab Cakes', 'Falafel',
  'Fried Rice', 'Guacamole', 'Mac and Cheese', 'Meat Loaf', 'Pulled Pork',
  'Shrimp Scampi', 'Stuffed Peppers', 'Tuna Melt', 'Veggie Burger', 'BBQ Ribs',
  'Banana Bread', 'Brownies', 'Carrot Cake', 'Donuts', 'Eclairs',
  'Fudge', 'Gelato', 'Hot Dogs', 'Ice Cream Sundae', 'Jelly Donuts',
  'Kung Pao Chicken', 'Lemon Tart', 'Macarons', 'Nachos', 'Omelette',
  'Pot Roast', 'Quesadilla', 'Red Velvet Cake', 'Scones', 'Tacos al Pastor',
  'Udon Noodles', 'Veal Marsala', 'Waldorf Salad', 'Zucchini Bread', 'Chicken Alfredo',
  'Beef Burrito', 'Chocolate Chip Cookies', 'Deviled Eggs', 'Eggplant Parmesan', 'Fruit Salad',
  'Grilled Cheese', 'Hash Browns', 'Indian Curry', 'Jambalaya', 'Korean BBQ',
  'Lamb Chops', 'Minestrone Soup', 'Onion Rings', 'Pork Chops', 'Quiche Lorraine',
  'Ravioli', 'Salmon Teriyaki', 'Tempura', 'Tzatziki', 'Vegan Burger',
];

export const RECIPE_CATEGORIES: readonly string[] = [
  'Dessert', 'Main Course', 'Appetizer', 'Soup', 'Salad', 'Breakfast',
];

export const RECIPE_AUTHORS: readonly string[] = [
  'Chef Maria', 'Chef John', 'Chef Sarah', 'Chef Tom', 'Chef Lisa', 'Chef Alex',
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    author: 'Chef Maria',
    text: 'Absolutely delicious! Made it for dinner last night.',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    author: 'John Cook',
    text: 'Easy to follow recipe. Kids loved it!',
    timestamp: '5 hours ago',
  },
];