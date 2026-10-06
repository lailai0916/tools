export const developmentPolishEn = {
  'utilityError.dockerValue': 'A Docker option requires a nonempty value before the next flag.',
} as const;

export const developmentPolishZhHans = {
  'utilityError.dockerValue': 'Docker 参数需要非空值，不能用后面的选项代替。',
} as const satisfies Record<keyof typeof developmentPolishEn, string>;
