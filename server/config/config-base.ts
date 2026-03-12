// import "dotenv/config";

// export const env = {
//   port: Number(process.env.PORT) || 3001,
//   geminiApiKey: process.env.GEMINI_API_KEY ?? null,
//   databaseUrl: process.env.DATABASE_URL ?? null,
//   nodeEnv: process.env.NODE_ENV ?? "development",
// } as const;


// import { load } from 'ts-dotenv';
// import configBase from './config-base-es';

// const configFilePath = `${process.cwd()}/.env`;
// console.log('Load config base at:', configFilePath);
// const config = load(
//     {
//         ...configBase,
//         ENV: {
//             default: 'production',
//             type: String,
//         },
//     },
//     configFilePath,
// );

// export default config;


import { load } from 'ts-dotenv';

const config = load({
  PORT: {
    default: 3001,
    type: Number,
  },
  GEMINI_API_KEY: {
    type: String,
    default: '',
  },
  GROQ_API_KEY: {
    type: String,
    default: '',
  },
});

export default config;