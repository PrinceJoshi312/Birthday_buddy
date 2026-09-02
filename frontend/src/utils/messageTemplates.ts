export type MessageStyle = 'Simple' | 'Funny' | 'Heartfelt' | 'Formal' | 'Best Friend';

export const MESSAGE_STYLES: { id: MessageStyle; label: string; emoji: string; desc: string }[] = [
  { id: 'Simple', label: 'Simple', emoji: '✨', desc: 'Short, clean & cheerful' },
  { id: 'Funny', label: 'Funny', emoji: '😂', desc: 'Playful jokes & celebration laughs' },
  { id: 'Heartfelt', label: 'Heartfelt', emoji: '💖', desc: 'Warm, sincere & meaningful' },
  { id: 'Formal', label: 'Formal', emoji: '🤝', desc: 'Polite, professional & respectful' },
  { id: 'Best Friend', label: 'Best Friend', emoji: '👯', desc: 'Ride-or-die bestie energy' },
];

export const MESSAGE_TEMPLATES: Record<MessageStyle, string[]> = {
  Simple: [
    "Happy Birthday {name}! 🎂 Wishing you a wonderful day filled with happiness!",
    "Happy Birthday, {name}! 🎉 Hope you have a fantastic celebration today!",
    "Wishing you the happiest of birthdays, {name}! 🎈 Enjoy every moment of your special day!",
    "Happy Birthday {name}! 🍰 Hope your day is filled with joy, laughter, and great memories!",
    "Cheers to you on your birthday, {name}! 🥂 Have a truly great one!",
    "Happy Birthday, {name}! 🌟 Wishing you all the best today and in the wonderful year ahead!",
  ],
  Funny: [
    "Happy Birthday {name}! Congratulations on surviving another 365 days around the sun 😂🎂",
    "Happy Birthday {name}! I was going to buy you a lavish gift, but my presence in your life is already priceless 🎁😜",
    "Happy Birthday, {name}! May your day be more pleasant than accidentally turning on your front camera 🤳🍰",
    "Happy Birthday {name}! You're not getting older, you're just leveling up and increasing in value 🎮🥳",
    "It's {name} Day! The universe legally requires you to eat cake for breakfast and ignore adult responsibilities today 👑🎉",
    "Happy Birthday {name}! Don't worry about getting older — you're still younger than you will be tomorrow! ⏳🎂",
  ],
  Heartfelt: [
    "Happy Birthday, {name}! 💖 Thank you for bringing so much warmth, kindness, and positivity into the world. Wishing you a year full of love and happiness!",
    "Wishing the happiest of birthdays to someone truly special, {name}! 🌟 I’m so grateful to have you in my life. Have an unforgettable day!",
    "Happy Birthday {name}! 🌸 May this new chapter bring you peace, good health, and all the happiness your kind heart deserves.",
    "Sending you my warmest thoughts and biggest hugs on your birthday, {name}! 🎂 You inspire everyone around you, and I hope your day is as wonderful as you are.",
    "Happy Birthday {name}! 💖 Celebrating the wonderful person you are today. Thank you for always being such a bright light in my life.",
  ],
  Formal: [
    "Wishing you a very Happy Birthday, {name}! May the upcoming year bring you continued health, happiness, and great success. 🎂",
    "Warmest birthday greetings, {name}! Wishing you a wonderful celebration and a prosperous year ahead. 🌟",
    "Happy Birthday, {name}! Thank you for all your support and dedication. Wishing you a rewarding and joyful year ahead. 🤝🎉",
    "Wishing you a delightful birthday and a successful year ahead, {name}. Have a great celebration! 🎈",
    "Happy Birthday, {name}! May your special day be filled with celebration and the year ahead with great achievements. 🥂",
  ],
  'Best Friend': [
    "HAPPY BIRTHDAY TO MY ABSOLUTE FAVORITE HUMAN {name}! 🥳✨ Ride or die forever! Can't wait to celebrate you today!",
    "Happy Birthday to my bestie {name}! 💖 Life is a million times more fun with you in it. Let's make this year our best adventure yet! 🚀🎂",
    "Happy Birthday {name}! 👯 So lucky to have a best friend like you who knows all my secrets and still hangs out with me. Love you tons! 🎉",
    "It's my best friend's birthday!! 🎂✨ {name}, you deserve the world and all the cake in it. Here's to making countless more unforgettable memories together!",
    "Happy Birthday to the one and only {name}! 🥂 Best friends like you come once in a lifetime. Let's party like we're never getting older! 🎈🔥",
  ],
};

export function getRandomMessage(
  style: MessageStyle,
  name: string,
  currentMessage?: string
): string {
  const templates = MESSAGE_TEMPLATES[style] || MESSAGE_TEMPLATES.Simple;
  const formattedName = name.trim() || 'Friend';

  // Filter out current message if possible to ensure fresh variety on regenerate
  const pool = currentMessage
    ? templates.filter((t) => !currentMessage.includes(t.replace('{name}', formattedName).substring(0, 20)))
    : templates;

  const selectedPool = pool.length > 0 ? pool : templates;
  const randomIndex = Math.floor(Math.random() * selectedPool.length);
  const template = selectedPool[randomIndex];

  return template.replace(/{name}/g, formattedName);
}
