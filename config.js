/*
 * EDIT THIS FILE TO PERSONALIZE THE INVITATION.
 * Keep image paths relative to this website folder, for example "assets/photo.jpg".
 * Leave an optional URL empty ("") when that action is not ready yet.
 */
window.invitationConfig = {
  // ========================================
  // WEBSITE
  // ========================================
  site: {
    language: "en",
    title: "Graduation Invitation · Class of {classOf}",
    description: "An invitation to celebrate a graduation, a journey, and the people who made it meaningful.",
    skipLink: "Skip to invitation",
  },

  // ========================================
  // GRADUATE INFORMATION
  // ========================================
  graduate: {
    name: "Hoang Thi Ha Phuong",
    shortName: "Ha Phuong",
    university: "Foreign Trade University - FTU",
    faculty: "",
    major: "",
    degree: "",
    classOf: "2026",
  },

  labels: {
    classOf: "Class of",
  },

  // ENVELOPE INTRO — set enabled to false to go straight to the website.
  intro: {
    enabled: true,
    label: "Graduation Invitation",
    openText: "Open invitation",
    recipient: "For You",
  },

  // ========================================
  // CEREMONY
  // ========================================
  ceremony: {
    date: {
      day: "20",
      month: "September",
      year: "2026",
      full: "20 September 2026",
    },
    time: "9:00 AM",
    timezone: "GMT+7",
    venue: "National Convention Center",
    address: "View on Google Maps",
  },

  // ========================================
  // HERO & INVITATION CONTENT
  // ========================================
  hero: {
    eyebrow: "A moment to remember",
    title: "Graduation",
    subtitle: "Invitations",
    scrollPrompt: "Scroll to open",
    edition: "A personal invitation",
  },
  invitation: {
    backdropHeading: "You're invited",
    fromLabel: "From",
    messages: [
      "You are invited to celebrate a moment of pride, joy, and achievement.",
      "Your presence would make this milestone even more special.",
    ],
    portraitCaption: "A moment of pride.",
    openingNote: "An invitation, just for you",
  },

  // ========================================
  // MEMORY, CEREMONY & PERSONAL COPY
  // ========================================
  memories: {
    eyebrow: "The moments that brought us here",
    title: "Years of memories.",
    closingLines: ["and I would love", "to celebrate it", "with you."],
  },
  ceremonySection: {
    eyebrow: "Save a little space in your day",
    titleLines: ["For a new", "beginning."],
    cardLabel: "The ceremony",
  },
  personalMessage: {
    eyebrow: "A little note, from me to you",
    paragraphs: [
      "A journey shaped by countless memories, challenges, friendships, and people who made every step meaningful.",
      ["I would be honored to have you", "with me on this special day."],
    ],
    signature: "Ha Phuong",
  },

  // ========================================
  // PHOTOS
  // ========================================
  images: {
    portrait: {
      src: "assets/portrait.jpg",
      alt: "Sample graduation portrait, to be replaced with your photograph",
    },
    memories: [
      {
        src: "assets/memory_1.jpg",
        alt: "Sample portrait of a graduate in cap and gown",
        caption: "One unforgettable milestone.",
      },
      {
        src: "assets/friends.jpg",
        alt: "Sample photo of two friends celebrating graduation",
        caption: "Countless moments.",
      },
      {
        src: "assets/celebration.jpg",
        alt: "Sample photograph of graduates celebrating together",
        caption: "The people who made it special.",
      },
    ],
  },

  // ========================================
  // RSVP, ENDING & LINKS
  // ========================================
  rsvp: {
    eyebrow: "A special day, made sweeter with you",
    label: "Celebrate With Me",
    note: "Come share a smile, a photo, and this milestone with me.",
    url: "",
    dialog: {
      closeLabel: "Close RSVP note",
      eyebrow: "An invitation from Ha Phuong",
      title: "Will you join me?",
      message: "I would love to celebrate my graduation with you at 9:00 AM on 20 September 2026 (GMT+7) at the National Convention Center. Let's take a few photos, share a little joy, and make another memory together. Please let me know if you can come — having you there would mean so much to me.",
      doneLabel: "Back to the invitation",
    },
  },
  ending: {
    eyebrow: "Until then",
    titleLines: ["See you", "on my special day."],
  },
  links: {
    googleMaps: "https://maps.app.goo.gl/Qn2tZNT4qDU9RWYW9",
    googleCalendar: "",
    facebook: "",
    instagram: "",
    zalo: "",
    messenger: "",
  },

  // ========================================
  // BACKGROUND ATMOSPHERE
  // ========================================
  ambience: {
    petals: true,
    music: {
      enabled: true,
      // Optional relative audio path, e.g. "assets/music.mp3".
      // Leave empty to use the gentle original instrumental.
      src: "assets/background_music.mp3",
      volume: 0.2,
      onText: "Music on",
      offText: "Music off",
      playLabel: "Play background music",
      pauseLabel: "Pause background music",
    },
  },

  // ========================================
  // OPTIONAL SECTIONS
  // ========================================
  sections: {
    memories: true,
    ceremony: true,
    personalMessage: true,
    rsvp: true,
  },
};
