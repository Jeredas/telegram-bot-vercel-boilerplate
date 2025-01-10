import { Context, Markup, Telegraf } from 'telegraf';
import createDebug from 'debug';
import * as dotenv from 'dotenv';
import { author, name, version } from '../../package.json';
import { LabeledPrice } from 'telegraf/typings/core/types/typegram';
const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  const message = `*${name} ${version}*\n${author}`;
  debug(`Triggered "about" command with message \n${message}`);
  
  const labelPrice: LabeledPrice = {
    label: 'Labael',
    amount: 60
  }
  const invocie = {
    title: 'Test invoice',
    description: 'Some decription',
    payload: 'Some payload',
    provider_token: process.env.PROVIDER_TOKEN || '',
    currency: 'USD',
    prices: [labelPrice, labelPrice],
  }
  ctx.replyWithInvoice(invocie, { reply_markup: {
    inline_keyboard: [],
    
  }});
  ctx.reply('', { reply_markup: {
    force_reply: true}
  });
  // await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
};

export { about };
