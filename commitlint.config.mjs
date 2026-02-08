export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'user',
        'listing',
        'consent',
        'config',
        'messaging',
        'moderation',
        'ui',
        'layout',
        'store',
        'hooks',
        'deps',
        'release',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
  },
};
