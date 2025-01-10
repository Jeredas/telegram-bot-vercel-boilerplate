import { Markup, Telegraf } from 'telegraf';
import {message} from 'telegraf/filters';
import * as dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import * as express from 'express';
import { NewInvoiceParameters } from 'telegraf/typings/telegram-types';
import { LabeledPrice } from 'telegraf/typings/core/types/typegram';
dotenv.config({path: './.env'});
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN);


const app = express()
const port = process.env.PORT || 4000;

app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const colors = [
  { name: 'Red', code: '#FF0000', emoji: '🟥' },
  { name: 'Green', code: '#00FF00', emoji: '🟩' },
  { name: 'Blue', code: '#0000FF', emoji: '🟦' },
  { name: 'Yellow', code: '#FFFF00', emoji: '🟨' },
  { name: 'Cyan', code: '#00FFFF', emoji: '🟦' },  // Using blue square for cyan
  { name: 'Magenta', code: '#FF00FF', emoji: '🟪' },
  { name: 'Black', code: '#000000', emoji: '⬛' },
  { name: 'White', code: '#FFFFFF', emoji: '⬜' },
];
// bot.start((ctx) => {
//   ctx.reply(
//     'Welcome! Use the buttons below to configure your web app.',
//     Markup.keyboard([
//       ['🔵 Button Color', '🖼️ Background'],
//       ['⚙️ Other Settings', 'ℹ️ Help'],
//     ])
//       .resize()
//       .oneTime()
//   );
// });
bot.start((ctx) => {
  ctx.reply(
    'Choose what to configure:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🔵 Buttons Color', 'configure_buttons_color')],
      [Markup.button.callback('🖼️ Background', 'configure_background')],
      [Markup.button.callback('⚙️ Other Settings', 'configure_background')],
      [Markup.button.callback('ℹ️ Help', 'configure_background')],

    ])
  );
});
bot.action('configure_buttons_color', (ctx) => {
  ctx.reply(
    'Choose a button color:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Primary color', 'primary_color')],
      [Markup.button.callback('Secondary color', 'secondary_color')],
    ])
  );
});
bot.action('primary_color', (ctx) => {
  ctx.reply(
    'Open color picker',
    Markup.inlineKeyboard([
      Markup.button.webApp('🎨 Open Color Picker', 'https://brilliant-pudding-321c8d.netlify.app/#/color_picker'),
      Markup.button.callback('Get primitive', 'get_primitive'),
    ])
  );
});
bot.action('get_primitive', (ctx) => {
  ctx.reply(
     'Select a color from the buttons below:',
    Markup.inlineKeyboard(
      colors.map((color) =>
        Markup.button.callback(color.emoji, `color_${color.name.toLowerCase()}`)
      )
    )
  );
});
// Handle background configuration
bot.action('configure_background', (ctx) => {
  ctx.reply(
    'Choose a background style:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🌅 Sunset', 'background_sunset')],
      [Markup.button.callback('🌌 Night Sky', 'background_night')],
    ])
  );
});
colors.forEach((color) => {
  bot.action(`color_${color.name.toLowerCase()}`, (ctx) => {
    ctx.reply(`You selected ${color.name} (${color.code})!`);
  });
});
// Handle specific color actions
bot.action('color_red', (ctx) => {
  ctx.reply('You selected red for button color.');
});

bot.action('color_blue', (ctx) => {
  ctx.reply('You selected blue for button color.');
});

// Handle specific background actions
bot.action('background_sunset', (ctx) => {
  ctx.reply('You selected Sunset as the background.');
});

bot.action('background_night', (ctx) => {
  ctx.reply('You selected Night Sky as the background.');
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

bot.command('color', (ctx) => {
  ctx.reply(
    'Click the button below to open the color picker:',
    Markup.inlineKeyboard([
      Markup.button.webApp('🎨 Open Color Picker', 'https://your-web-app.com'),
    ])
  );
});

bot.on(message('web_app_data'), (ctx) => {
  console.log(ctx)
  let amount = 50;
  const data = ctx.webAppData?.data as any
  if(data.type === 'generate_payment'){
    amount = data.amount
  }
  const price :LabeledPrice = {
    label: 'GROM',
    amount: amount
  }

  const invoice:NewInvoiceParameters = {
    title: 'Стрижка и бритьё',
    description: 'Оплатить стрижку',
    payload: 'Internal payload',
    provider_token: process.env.PROVIDER_TOKEN || '',
    currency: 'BYN',
    prices: [price]
  }
  ctx.sendInvoice(invoice);
});
//dev mode
ENVIRONMENT !== 'production' && development(bot);

bot.launch()

