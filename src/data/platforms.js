// Platform configurations with demographic data and activity models.
// Activity peaks use Gaussian functions: weight * exp(-((h - peak)² / (2σ²)))

export const platforms = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    emoji: '📷',
    label: 'Instagram Reels',
    ageGroups: [
      { id: '13-17', label: '13–17 years' },
      { id: '18-24', label: '18–24 years' },
      { id: '25-34', label: '25–34 years' },
      { id: '35-44', label: '35–44 years' },
      { id: '45-54', label: '45–54 years' },
      { id: '55-64', label: '55–64 years' },
      { id: '65+', label: '65+ years' },
    ],
    hasGender: true,
    hasAge: true,
    activityPeaks: {
      '13-17': [{ h: 15, w: 1.0, s: 2.5 }, { h: 21, w: 1.5, s: 2.5 }],
      '18-24': [{ h: 12, w: 0.8, s: 2.5 }, { h: 19, w: 1.3, s: 3 }, { h: 22, w: 1.5, s: 2.5 }],
      '25-34': [{ h: 12.5, w: 0.9, s: 2.5 }, { h: 20.5, w: 1.5, s: 3 }],
      '35-44': [{ h: 8.5, w: 1.0, s: 2.5 }, { h: 19, w: 1.2, s: 3 }],
      '45-54': [{ h: 8, w: 1.0, s: 2.5 }, { h: 18.5, w: 1.1, s: 3 }],
      '55-64': [{ h: 8, w: 1.1, s: 2.5 }, { h: 18, w: 1.0, s: 3 }],
      '65+': [{ h: 9, w: 1.1, s: 3 }, { h: 17, w: 0.9, s: 3 }],
    },
    dayMultipliers: {
      monday: 0.95, tuesday: 1.0, wednesday: 1.0, thursday: 1.0,
      friday: 0.95, saturday: 0.9, sunday: 1.05,
    },
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    emoji: '🎵',
    label: 'TikTok Videos',
    ageGroups: [
      { id: '13-17', label: '13–17 years' },
      { id: '18-24', label: '18–24 years' },
      { id: '25-34', label: '25–34 years' },
      { id: '35-44', label: '35–44 years' },
      { id: '45-54', label: '45–54 years' },
      { id: '55+', label: '55+ years' },
    ],
    hasGender: true,
    hasAge: true,
    activityPeaks: {
      '13-17': [{ h: 16, w: 1.0, s: 2.5 }, { h: 21.5, w: 1.5, s: 2.5 }],
      '18-24': [{ h: 13, w: 0.8, s: 2.5 }, { h: 20, w: 1.3, s: 3 }, { h: 23, w: 1.4, s: 2.5 }],
      '25-34': [{ h: 12, w: 0.9, s: 2.5 }, { h: 20.5, w: 1.4, s: 3 }],
      '35-44': [{ h: 12.5, w: 0.9, s: 2.5 }, { h: 20, w: 1.2, s: 3 }],
      '45-54': [{ h: 13, w: 0.9, s: 3 }, { h: 19.5, w: 1.0, s: 3 }],
      '55+': [{ h: 14, w: 0.9, s: 3 }, { h: 19, w: 0.9, s: 3 }],
    },
    dayMultipliers: {
      monday: 0.95, tuesday: 1.0, wednesday: 1.0, thursday: 1.0,
      friday: 1.05, saturday: 1.1, sunday: 1.05,
    },
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    emoji: '👻',
    label: 'Snapchat Spotlight',
    ageGroups: [
      { id: '13-17', label: '13–17 years' },
      { id: '18-24', label: '18–24 years' },
      { id: '25-34', label: '25–34 years' },
      { id: '35-44', label: '35–44 years' },
      { id: '45+', label: '45+ years' },
    ],
    hasGender: true,
    hasAge: true,
    activityPeaks: {
      '13-17': [{ h: 15, w: 1.0, s: 2.5 }, { h: 20.5, w: 1.5, s: 2.5 }],
      '18-24': [{ h: 11, w: 0.8, s: 2.5 }, { h: 16, w: 1.0, s: 3 }, { h: 21, w: 1.4, s: 2.5 }],
      '25-34': [{ h: 12, w: 0.9, s: 2.5 }, { h: 20, w: 1.2, s: 3 }],
      '35-44': [{ h: 12.5, w: 0.9, s: 3 }, { h: 19.5, w: 1.0, s: 3 }],
      '45+': [{ h: 13, w: 0.9, s: 3 }, { h: 19, w: 0.9, s: 3 }],
    },
    dayMultipliers: {
      monday: 1.0, tuesday: 1.0, wednesday: 1.0, thursday: 1.0,
      friday: 1.05, saturday: 1.1, sunday: 1.0,
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    emoji: '▶️',
    label: 'YouTube Shorts',
    ageGroups: [
      { id: '13-17', label: '13–17 years' },
      { id: '18-24', label: '18–24 years' },
      { id: '25-34', label: '25–34 years' },
      { id: '35-44', label: '35–44 years' },
      { id: '45-54', label: '45–54 years' },
      { id: '55-64', label: '55–64 years' },
      { id: '65+', label: '65+ years' },
    ],
    hasGender: true,
    hasAge: true,
    activityPeaks: {
      '13-17': [{ h: 16, w: 1.0, s: 3 }, { h: 21, w: 1.3, s: 2.5 }],
      '18-24': [{ h: 13, w: 0.9, s: 3 }, { h: 21, w: 1.4, s: 2.5 }],
      '25-34': [{ h: 12.5, w: 0.9, s: 3 }, { h: 20.5, w: 1.4, s: 3 }],
      '35-44': [{ h: 12, w: 1.0, s: 3 }, { h: 20, w: 1.3, s: 3 }],
      '45-54': [{ h: 12, w: 1.0, s: 3 }, { h: 19.5, w: 1.2, s: 3 }],
      '55-64': [{ h: 10, w: 1.0, s: 3 }, { h: 19, w: 1.1, s: 3 }],
      '65+': [{ h: 10, w: 1.1, s: 3 }, { h: 18.5, w: 1.0, s: 3 }],
    },
    dayMultipliers: {
      monday: 1.0, tuesday: 1.0, wednesday: 1.0, thursday: 1.0,
      friday: 1.0, saturday: 1.05, sunday: 1.05,
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    emoji: '👥',
    label: 'Facebook Reels',
    ageGroups: [
      { id: '13-17', label: '13–17 years' },
      { id: '18-24', label: '18–24 years' },
      { id: '25-34', label: '25–34 years' },
      { id: '35-44', label: '35–44 years' },
      { id: '45-54', label: '45–54 years' },
      { id: '55-64', label: '55–64 years' },
      { id: '65+', label: '65+ years' },
    ],
    hasGender: true,
    hasAge: true,
    activityPeaks: {
      '13-17': [{ h: 16, w: 0.9, s: 3 }, { h: 20, w: 1.0, s: 3 }],
      '18-24': [{ h: 12, w: 0.9, s: 3 }, { h: 20, w: 1.1, s: 3 }],
      '25-34': [{ h: 9, w: 1.0, s: 2.5 }, { h: 19.5, w: 1.2, s: 3 }],
      '35-44': [{ h: 8.5, w: 1.1, s: 2.5 }, { h: 19, w: 1.2, s: 3 }],
      '45-54': [{ h: 8.5, w: 1.2, s: 2.5 }, { h: 18.5, w: 1.1, s: 3 }],
      '55-64': [{ h: 8, w: 1.2, s: 2.5 }, { h: 18, w: 1.0, s: 3 }],
      '65+': [{ h: 8.5, w: 1.2, s: 3 }, { h: 17.5, w: 0.9, s: 3 }],
    },
    dayMultipliers: {
      monday: 1.0, tuesday: 1.0, wednesday: 1.0, thursday: 1.0,
      friday: 0.95, saturday: 0.9, sunday: 0.95,
    },
  },
};

export const platformList = Object.values(platforms);

// Indexed by Date.getDay() (0 = Sunday) — optimizer.js indexes these with
// getUTCDay() results.
export const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const dayLabelsShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
