const SITE_URL = "https://yah2oo.github.io/yagmurasigim/";

async function sendTelegramMessage(token, chatId, text, replyMarkup) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    })
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${details}`);
  }
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("Yagmurasigim Telegram bot is running.", {
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    if (url.pathname === "/setup" && request.method === "POST") {
      if (!env.SETUP_SECRET || request.headers.get("authorization") !== `Bearer ${env.SETUP_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET) {
        return new Response("BOT_TOKEN ve WEBHOOK_SECRET secret'lari eksik.", { status: 500 });
      }

      const webhookUrl = `${url.origin}/webhook`;
      const telegramResponse = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: env.WEBHOOK_SECRET,
          allowed_updates: ["message"]
        })
      });
      const result = await telegramResponse.json();
      return Response.json(result, { status: telegramResponse.ok ? 200 : 502 });
    }

    if (url.pathname !== "/webhook" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.ACCESS_CODE) {
      return new Response("Bot secrets are not configured.", { status: 500 });
    }

    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Bad JSON", { status: 400 });
    }

    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = typeof message?.text === "string" ? message.text.trim() : "";

    // Ignore group chats and messages without text.
    if (!chatId || message?.chat?.type !== "private" || !text) {
      return new Response("OK");
    }

    if (text === "/start") {
      await sendTelegramMessage(
        env.BOT_TOKEN,
        chatId,
        "Selam! Sana özel bir sürpriz var. Gizli erişim kodunu gönder bakalım. 🔐"
      );
      return new Response("OK");
    }

    if (text === env.ACCESS_CODE) {
      await sendTelegramMessage(
        env.BOT_TOKEN,
        chatId,
        "Kod doğru! 🎉 İşte beklediğin sürpriz: " + SITE_URL,
        {
          inline_keyboard: [[
            { text: "Sürprizi aç ❤️", url: SITE_URL }
          ]]
        }
      );
      return new Response("OK");
    }

    await sendTelegramMessage(
      env.BOT_TOKEN,
      chatId,
      "Hmm, bu kod olmadı. 🤨 Bir daha düşün bakalım... İpucu: beş rakamlı!"
    );
    return new Response("OK");
  }
};
