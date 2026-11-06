# Telegram sürpriz botu

Bu Worker, Telegram'da özel mesaj olarak gönderilen `91123` koduna site bağlantısını yollar.

## Cloudflare kurulumu

1. Cloudflare hesabında **Workers & Pages** > **Create** > **Create Worker** bölümünden bir Worker oluştur.
2. Worker adını örneğin `yagmurasigim-bot` yap.
3. Bu klasördeki `worker.js` içeriğini Worker editörüne yapıştır ve Deploy et.
4. Worker > Settings > Variables and Secrets bölümüne şu dört değeri **Secret** türünde ekle:
   - `BOT_TOKEN`: BotFather'ın verdiği bot token'ı.
   - `WEBHOOK_SECRET`: Uzun ve tahmin edilmesi zor bir harf/rakam/_/- dizisi.
   - `ACCESS_CODE`: `91123`
   - `SETUP_SECRET`: Ayrı, uzun ve tahmin edilmesi zor bir kurulum anahtarı.
5. Değişkenleri kaydedip tekrar Deploy et.
6. PowerShell'de aşağıdaki komutları çalıştır. İkinci satırda Worker adresini kendi adresinle değiştir. Değerleri sohbete gönderme.

```powershell
$setupSecret = Read-Host "SETUP_SECRET degerini gir"
$headers = @{ Authorization = "Bearer $setupSecret" }
Invoke-RestMethod -Method Post -Uri "https://WORKER-ADRESIN.workers.dev/setup" -Headers $headers
```

Telegram'dan botuna `/start` yazıp ardından `91123` göndererek dene.

## BotFather

Telegram'da `@BotFather` ile sohbet aç:
- `/newbot` komutunu gönder.
- Görünen ad ve `_bot` ile biten benzersiz kullanıcı adı seç.
- Verilen token'ı sadece Cloudflare'daki `BOT_TOKEN` Secret alanına ekle. Token'ı kimseyle paylaşma.

## Not

- Worker, yalnızca özel sohbetlerden gelen mesajları işler.
- Doğru kodu yazan kişiye herkese açık GitHub Pages bağlantısını yollar. Bu kod bir erişim kapısı değildir; bağlantı paylaşıldığında herkes siteyi açabilir.
- Cloudflare Workers Free plan sınırları ve şartları değişebilir; güncel limitleri Cloudflare dokümantasyonundan kontrol et.
