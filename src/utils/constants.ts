export const MEMBERSHIP_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ELITE: 'elite',
} as const;

export const TIER_FEATURES = {
  [MEMBERSHIP_TIERS.FREE]: {
    swipesPerDay: 10,
    videoUploads: 3,
    superLikes: 1,
    price: 0,
  },
  [MEMBERSHIP_TIERS.PREMIUM]: {
    swipesPerDay: 50,
    videoUploads: 10,
    superLikes: 5,
    price: 9.99,
  },
  [MEMBERSHIP_TIERS.ELITE]: {
    swipesPerDay: -1, // unlimited
    videoUploads: -1, // unlimited
    superLikes: 10,
    price: 19.99,
  },
} as const;

export const GENDER_IDENTITIES = [
  'Agender',
  'Bigender',
  'Female',
  'Gender Fluid',
  'Gender Non-conforming',
  'Gender Questioning',
  'Gender Variant',
  'Genderqueer',
  'Male',
  'Non-binary',
  'Pangender',
  'Trans Female',
  'Trans Male',
  'Trans Person',
  'Two-Spirit',
  'Other',
] as const;

export const SEXUAL_ORIENTATIONS = [
  'Asexual',
  'Bisexual',
  'Demisexual',
  'Gay',
  'Lesbian',
  'Pansexual',
  'Queer',
  'Questioning',
  'Straight',
  'Other',
] as const;

export const MAX_VIDEO_DURATION = {
  SHORT: 3,
  MEDIUM: 6,
  LONG: 9,
} as const;

export const MAX_BIO_LENGTH = 500;
export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const DEFAULT_RADIUS = 50; // km