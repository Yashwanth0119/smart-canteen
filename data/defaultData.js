export const defaultUsers = [
  {
    username: 'E0225036',
    password: '1234',
    name: 'Yash',
    role: 'student',
    balance: 1000,
    department: 'Cyber Security & IoT',
    phone: '+91 98450 11223'
  },
  {
    username: 'E025015',
    password: '690141',
    name: 'Yashwanth',
    role: 'student',
    balance: 0,
    department: 'Computer Science & Engineering',
    phone: '+91 98765 43210'
  },
  {
    username: 'E025016',
    password: '1234',
    name: 'Ananya Sharma',
    role: 'student',
    balance: 0,
    department: 'Electronics & Communication',
    phone: '+91 98765 12345'
  },
  {
    username: 'TEACHER01',
    password: 'teacher123',
    name: 'Prof. Sneha Rao',
    role: 'teacher',
    balance: 500,
    department: 'Computer Science & Engineering Faculty',
    phone: '+91 98333 44556'
  },
  {
    username: 'WORKER01',
    password: '690141',
    name: 'Ramesh Kumar (Canteen Manager)',
    role: 'worker',
    balance: 0,
    department: 'Central Canteen Staff',
    phone: '+91 98111 22233'
  }
];

export const defaultMenuItems = [
  {
    id: 'item_1',
    name: 'Masala Dosa with Sambar & Chutney',
    category: 'Breakfast',
    price: 55,
    description: 'Crispy golden crepe stuffed with spiced potato filling, served with piping hot lentil sambar and fresh coconut chutney.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 8,
    isAvailable: true,
    rating: 4.8,
    inStockCount: 40
  },
  {
    id: 'item_2',
    name: 'Steamed Idli Vada Combo',
    category: 'Breakfast',
    price: 45,
    description: 'Two fluffy steamed rice cakes and one crispy medu vada served with freshly ground coconut chutney and tangy sambar.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 5,
    isAvailable: true,
    rating: 4.6,
    inStockCount: 35
  },
  {
    id: 'item_3',
    name: 'Paneer Butter Masala Meal Box',
    category: 'Meals',
    price: 110,
    description: 'Cottage cheese cubes simmered in rich buttery tomato gravy, served with 2 butter naans, jeera rice, and salad.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 12,
    isAvailable: true,
    rating: 4.9,
    inStockCount: 25
  },
  {
    id: 'item_4',
    name: 'Veg Hakka Noodles with Manchurian',
    category: 'Fast Food',
    price: 90,
    description: 'Wok-tossed noodles with crunchy bell peppers, shredded cabbage, carrots, accompanied by 3 vegetable Manchurian balls in rich sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 10,
    isAvailable: true,
    rating: 4.7,
    inStockCount: 30
  },
  {
    id: 'item_5',
    name: 'Grilled Cheese Sandwich',
    category: 'Snacks',
    price: 60,
    description: 'Toasted whole wheat bread layered with melted cheddar, mozzarella, sliced cucumbers, tomatoes, and green mint chutney.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 7,
    isAvailable: true,
    rating: 4.5,
    inStockCount: 20
  },
  {
    id: 'item_6',
    name: 'Samosa Chaat (2 Pcs)',
    category: 'Snacks',
    price: 40,
    description: 'Crushed spiced potato samosas garnished with warm chana masala, chilled sweet curd, tamarind chutney, sev, and fresh coriander.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 5,
    isAvailable: false,
    rating: 4.8,
    inStockCount: 0
  },
  {
    id: 'item_7',
    name: 'South Indian Filter Coffee',
    category: 'Beverages',
    price: 25,
    description: 'Traditional decoction brewed coffee mixed with frothy hot boiled milk, served in stainless steel tumbler style.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 3,
    isAvailable: true,
    rating: 4.9,
    inStockCount: 60
  },
  {
    id: 'item_8',
    name: 'Classic Chicken & Cheese Club Sandwich',
    category: 'Snacks',
    price: 70,
    description: 'Toasted multigrain bread layered with sliced smoked chicken, cheddar cheese, crisp garden lettuce, tomatoes, and creamy herb mayo.',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 6,
    isAvailable: true,
    rating: 4.8,
    inStockCount: 25
  },
  {
    id: 'item_9',
    name: 'Crispy Veg Burger & Peri-Peri Fries',
    category: 'Fast Food',
    price: 85,
    description: 'Herb potato patty topped with creamy mayo, fresh lettuce, sliced onions, accompanied by crunchy peri-peri seasoned french fries.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 9,
    isAvailable: true,
    rating: 4.6,
    inStockCount: 22
  },
  {
    id: 'item_10',
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'Meals',
    price: 140,
    description: 'Fragrant basmati rice layered with spiced tender chicken cuts, saffron, fried onions, served with cooling cucumber raita and spicy salan.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 10,
    isAvailable: true,
    rating: 4.9,
    inStockCount: 30
  },
  {
    id: 'item_11',
    name: 'Crispy Chicken Burger & Fries',
    category: 'Fast Food',
    price: 95,
    description: 'Golden fried seasoned chicken patty topped with crunchy iceberg lettuce, melted cheese slice, tangy garlic mayo, and hot fries.',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 8,
    isAvailable: true,
    rating: 4.8,
    inStockCount: 25
  },
  {
    id: 'item_12',
    name: 'Chicken Shawarma Egg Roll',
    category: 'Snacks',
    price: 75,
    description: 'Warm flaky paratha layered with beaten egg, shredded grilled chicken pieces, pickled onions, mint mayo, and chaat spices.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 6,
    isAvailable: true,
    rating: 4.7,
    inStockCount: 35
  },
  {
    id: 'item_13',
    name: 'Egg Fried Rice with Chicken Manchurian',
    category: 'Meals',
    price: 120,
    description: 'Wok-tossed rice with fluffy scrambled eggs, spring onions, and light soy sauce, paired with boneless chicken Manchurian gravy.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 12,
    isAvailable: true,
    rating: 4.8,
    inStockCount: 20
  },
  {
    id: 'item_14',
    name: 'Double Egg Cheese Omelette Pav',
    category: 'Breakfast',
    price: 50,
    description: 'Two farm eggs whisked with chopped onions, green chilies, cilantro, stuffed with melted cheese, served with two butter-toasted pavs.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 5,
    isAvailable: true,
    rating: 4.6,
    inStockCount: 40
  },
  {
    id: 'item_15',
    name: 'Spicy Chicken Popcorn (Canteen Bowl)',
    category: 'Snacks',
    price: 85,
    description: 'Bite-sized tender boneless chicken nuggets breaded in spicy batter, fried golden crisp, served with zesty chipotle dip.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    prepTime: 7,
    isAvailable: true,
    rating: 4.7,
    inStockCount: 30
  },
  {
    id: 'item_16',
    name: 'Mango Lassi (Chilled)',
    category: 'Beverages',
    price: 45,
    description: 'Refreshing traditional yogurt drink blended with Alphonso mango pulp, fragrant cardamom, and garnished with chopped pistachios.',
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    prepTime: 4,
    isAvailable: true,
    rating: 4.9,
    inStockCount: 35
  }
];

export const defaultOrders = [
  {
    id: 'ord_past_01',
    orderNumber: 'CAN-2045',
    studentId: 'E0225036',
    studentName: 'Yash',
    items: [
      {
        menuItemId: 'item_2',
        name: 'Steamed Idli Vada Combo',
        price: 45,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
      },
      {
        menuItemId: 'item_7',
        name: 'South Indian Filter Coffee',
        price: 25,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      }
    ],
    totalAmount: 70,
    pickupSlot: '12:45 PM Lunch Break (Shift 1)',
    notes: 'Crispy vada please',
    paymentMethod: 'Smart Wallet',
    status: 'Completed',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
  },
  {
    id: 'ord_past_02',
    orderNumber: 'CAN-1082',
    studentId: 'E025015',
    studentName: 'Yashwanth',
    items: [
      {
        menuItemId: 'item_1',
        name: 'Masala Dosa with Sambar & Chutney',
        price: 55,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'
      },
      {
        menuItemId: 'item_7',
        name: 'South Indian Filter Coffee',
        price: 25,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      }
    ],
    totalAmount: 80,
    pickupSlot: '12:45 PM Lunch Break (Shift 1)',
    notes: 'Extra crispy dosa',
    paymentMethod: 'Smart Wallet',
    status: 'Completed',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 27 * 3600 * 1000).toISOString()
  },
  {
    id: 'ord_past_03',
    orderNumber: 'CAN-3190',
    studentId: 'E025016',
    studentName: 'Ananya Sharma',
    items: [
      {
        menuItemId: 'item_4',
        name: 'Veg Hakka Noodles with Manchurian',
        price: 90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80'
      }
    ],
    totalAmount: 90,
    pickupSlot: '01:15 PM Lunch Break (Shift 2)',
    notes: 'Medium spice level',
    paymentMethod: 'Online UPI',
    status: 'Completed',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString()
  }
];

export const defaultPickupSlots = [
  { id: 'slot_1', label: 'Immediate (10-15 mins)', time: 'Immediate', isFull: false, maxCapacity: 30, currentBookings: 8 },
  { id: 'slot_2', label: '12:45 PM Lunch Break (Shift 1)', time: '12:45 PM', isFull: false, maxCapacity: 25, currentBookings: 14 },
  { id: 'slot_3', label: '01:15 PM Lunch Break (Shift 2)', time: '01:15 PM', isFull: true, maxCapacity: 20, currentBookings: 20 },
  { id: 'slot_4', label: '02:00 PM Afternoon Break', time: '02:00 PM', isFull: false, maxCapacity: 15, currentBookings: 3 },
  { id: 'slot_5', label: '04:30 PM Evening Snack Time', time: '04:30 PM', isFull: false, maxCapacity: 30, currentBookings: 12 },
  { id: 'slot_6', label: '05:30 PM Dinner Pre-Order', time: '05:30 PM', isFull: false, maxCapacity: 20, currentBookings: 5 }
];

