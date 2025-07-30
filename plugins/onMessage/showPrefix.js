const langData = {
  "en_US": {
    "prefix": "🌐 Prefix is: {prefix}"
  }
};

async function onCall({ message, getLang, data }) {
  const messageBody = message.body?.toLowerCase()?.trim();
  const prefixTriggers = ["prefix", "prefix?", "Prefix"];

  if (prefixTriggers.includes(messageBody) && message.senderID !== global.botID) {
    const prefix = data?.thread?.data?.prefix || global.config.PREFIX;
    const botName = global.config.NAME;

    const replyText = getLang("prefix", {
      prefix,
      botname: botName
    });

    await message.reply(replyText);
  }
}

export default {
  langData,
  onCall
};
