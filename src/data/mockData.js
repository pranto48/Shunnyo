export const currentUser = {
  id: 'user-me',
  name: 'Arif Mahmud',
  username: '@arif_shunnyo',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  status: 'online',
  customStatus: 'Coding Shunnyo PWA 🚀',
  phone: '+880 1700-000000',
  email: 'arif@shunnyo.io'
};

export const initialContacts = [
  {
    id: 'c-1',
    name: 'Nafis Chowdhury',
    username: '@nafis_ai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customStatus: 'Reviewing UI Architecture 🎨',
    unreadCount: 2,
    pinned: true,
    lastSeen: 'Just now',
    phone: '+880 1811-223344',
    email: 'nafis@antigravity.dev',
    role: 'Lead Architect',
    isTyping: false
  },
  {
    id: 'c-2',
    name: 'Tania Rahman',
    username: '@tania_design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customStatus: 'Polishing dark mode gradients ✨',
    unreadCount: 0,
    pinned: true,
    lastSeen: '5m ago',
    phone: '+880 1922-334455',
    email: 'tania@designhub.co',
    role: 'Product Designer',
    isTyping: false
  },
  {
    id: 'c-3',
    name: 'Shunnyo Core Engineering',
    username: '#shunnyo-core',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    isGroup: true,
    membersCount: 8,
    customStatus: 'Sprint 24: Realtime WebRTC & PWA Engine',
    unreadCount: 5,
    pinned: false,
    lastSeen: '12m ago',
    role: 'Engineering Group',
    isTyping: false
  },
  {
    id: 'c-4',
    name: 'Kamrul Hasan',
    username: '@kamrul_dev',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    status: 'away',
    customStatus: 'Testing WebRTC mesh connections ⚡',
    unreadCount: 0,
    pinned: false,
    lastSeen: '25m ago',
    phone: '+880 1733-445566',
    email: 'kamrul@cloudinfra.net',
    role: 'DevOps & Media Engineer',
    isTyping: false
  },
  {
    id: 'c-5',
    name: 'Sarah Jenkins',
    username: '@sarah_j',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'busy',
    customStatus: 'In a client presentation 📊',
    unreadCount: 0,
    pinned: false,
    lastSeen: '1h ago',
    phone: '+1 (555) 321-9870',
    email: 'sarah@globaltech.io',
    role: 'Product Strategy',
    isTyping: false
  },
  {
    id: 'c-6',
    name: 'Zubair Ahmed',
    username: '@zubair_sec',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    customStatus: 'End-to-End Encryption Audit 🔒',
    unreadCount: 0,
    pinned: false,
    lastSeen: 'Yesterday at 11:40 PM',
    phone: '+880 1555-667788',
    email: 'zubair@securityvault.org',
    role: 'Cybersecurity Analyst',
    isTyping: false
  }
];

export const initialMessages = {
  'c-1': [
    {
      id: 'm-101',
      senderId: 'c-1',
      senderName: 'Nafis Chowdhury',
      content: 'শুভ সন্ধ্যা আরিফ ভাই! Shunnyo PWA এর ডার্ক থিম আর্কিটেকচারটা কি রেডি?',
      timestamp: '9:30 PM',
      status: 'read',
      reactions: ['🚀', '❤️']
    },
    {
      id: 'm-102',
      senderId: 'user-me',
      senderName: 'Arif Mahmud',
      content: 'হ্যাঁ নাফিস ভাই! সম্পূর্ণ Tailwind CSS ডার্ক-মোড, গ্লাস মরফিজম এবং পিডব্লিউএ সাপোর্ট সহ তৈরি করা হচ্ছে।',
      timestamp: '9:32 PM',
      status: 'read'
    },
    {
      id: 'm-103',
      senderId: 'c-1',
      senderName: 'Nafis Chowdhury',
      content: 'চমৎকার! অডিও এবং ভিডিও কলের ইন্টারফেসটাও একটু চেক করতে পারি?',
      timestamp: '9:35 PM',
      status: 'read',
      reactions: ['👍']
    },
    {
      id: 'm-104',
      senderId: 'c-1',
      senderName: 'Nafis Chowdhury',
      content: 'আমি অডিও ওয়েভফর্ম এবং ক্যামেরা পিআইপি মোড এর জন্য প্রস্তুত। উপরের কল বাটন চেপে টেস্ট করা যাবে!',
      timestamp: '9:38 PM',
      status: 'read',
      attachment: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        caption: 'Shunnyo UI Concept Preview'
      }
    }
  ],
  'c-2': [
    {
      id: 'm-201',
      senderId: 'c-2',
      senderName: 'Tania Rahman',
      content: 'হাই! নতুন ডার্ক কালার প্যালেটের জন্য ভায়োলেট এবং সায়ান অ্যাকসেন্ট ব্যবহার করেছি।',
      timestamp: '8:45 PM',
      status: 'read',
      reactions: ['✨', '🔥']
    },
    {
      id: 'm-202',
      senderId: 'user-me',
      senderName: 'Arif Mahmud',
      content: 'অসাধারণ লাগছে তানিয়া! মেসেজ বাবলস ও স্ট্যাটাস ব্যাজে দারুণ কনট্রাস্ট আসছে।',
      timestamp: '8:50 PM',
      status: 'read'
    },
    {
      id: 'm-203',
      senderId: 'c-2',
      senderName: 'Tania Rahman',
      content: 'ভয়েস নোটের জন্য একটা কাস্টম অডিও প্লেয়ার বাবলও তৈরি রাখা হয়েছে।',
      timestamp: '9:00 PM',
      status: 'read',
      audioDuration: '0:28'
    }
  ],
  'c-3': [
    {
      id: 'm-301',
      senderId: 'c-4',
      senderName: 'Kamrul Hasan',
      content: 'টিম, WebRTC মিডিয়া স্ট্রিম কানেকশন অপ্টিমাইজ করা হয়েছে। লেটেন্সি ৩০ মিলিসেকেন্ডের নিচে!',
      timestamp: '7:15 PM',
      status: 'read'
    },
    {
      id: 'm-302',
      senderId: 'c-1',
      senderName: 'Nafis Chowdhury',
      content: 'দারুণ অগ্রগতি! PWA অফলাইন সার্ভিস ওয়ার্কার ক্যাশিংও প্রস্তুত।',
      timestamp: '7:20 PM',
      status: 'read',
      reactions: ['🙌']
    },
    {
      id: 'm-303',
      senderId: 'user-me',
      senderName: 'Arif Mahmud',
      content: 'Shunnyo Messaging v1.0 বিল্ড সম্পূর্ণ সফল।',
      timestamp: '7:30 PM',
      status: 'delivered'
    }
  ],
  'c-4': [
    {
      id: 'm-401',
      senderId: 'c-4',
      senderName: 'Kamrul Hasan',
      content: 'ভাই, ফ্রি হলে একটা টেস্ট অডিও কল দিন, মাইক ও নয়েজ ক্যান্সেলেশন টেস্ট করবো।',
      timestamp: '6:10 PM',
      status: 'read'
    }
  ],
  'c-5': [
    {
      id: 'm-501',
      senderId: 'c-5',
      senderName: 'Sarah Jenkins',
      content: 'Hi Arif, the project roadmap looks fantastic. Ready for the live demo whenever you are.',
      timestamp: 'Yesterday',
      status: 'read'
    }
  ],
  'c-6': [
    {
      id: 'm-601',
      senderId: 'c-6',
      senderName: 'Zubair Ahmed',
      content: 'সিকিউরিটি হ্যান্ডশেক ও এন্ড-টু-এন্ড এনক্রিপশন প্রোটোকল ভেরিফাইড।',
      timestamp: 'Yesterday',
      status: 'read'
    }
  ]
};

export const simulatedReplies = [
  'অসংখ্য ধন্যবাদ! এটা সত্যিই চমৎকার কাজ করছে।',
  'আমি ফিচারটি পরীক্ষা করে দেখলাম, পারফরম্যান্স অত্যন্ত দ্রুত ও স্মুথ।',
  'Shunnyo PWA এর রেসপন্সিভ ডিজাইন মোবাইল এবং ডেস্কটপ দুটোতেই দারুণ মানিয়েছে!',
  'অডিও এবং ভিডিও কলের কোয়ালিটি বেশ ক্লিয়ার।',
  'দারুণ! পরবর্তী আপডেটে আমরা আরও কিছু কাস্টমাইজেশন যোগ করতে পারি।',
  '👍 পারফেক্ট! কোনো বাগ পাওয়া যায়নি।'
];
