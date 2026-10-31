# NutriCare

İlaç, ilaç-besin etkileşimi ve klinik beslenme bilgi asistanı. Next.js + Supabase Auth/Postgres + model API kullanır. Aşağıdaki eski Chatbot UI belgeleri upstream referansıdır; NutriCare kurulumu için bu bölüm geçerlidir.

## Kurulum ve Vercel

1. `npm ci` çalıştırın. `.env.local.example` dosyasını `.env.local` olarak kopyalayıp Supabase URL/anon anahtarını ve `GOOGLE_GEMINI_API_KEY` değerini ayarlayın. Anahtarları Git'e eklemeyin. `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucuda dosya işlemleri gibi yönetim gerektiren eski uçlar içindir.
2. Mevcut Supabase projesini `supabase link --project-ref <project-ref>` ile bağlayın; `supabase db push --dry-run` ile kontrol edip `supabase db push` çalıştırın. Yeni hesap onarımı için `20261030000000_repair_nutricare_accounts.sql` mutlaka uygulanmalıdır. Mevcut üretim veritabanında `db reset` kullanmayın.
3. Supabase Authentication > URL Configuration içinde Site URL değerini `https://www.nutricaretek.com` yapın. Redirect URLs listesine `https://www.nutricaretek.com/auth/callback`, `https://www.nutricaretek.com/auth/callback?next=/login/password` ve yerel geliştirme için karşılık gelen localhost adreslerini ekleyin. Önizleme ortamını test edecekseniz o ortamın callback adresini de ekleyin.
4. Email sağlayıcısı ve yeni kullanıcı kaydı açık olmalıdır. Confirm email açıkken kullanıcıya onay e-postası gösterilir, onay kapalıysa doğrudan sohbet açılır. Genel kullanıma açık kayıt/onay ve şifre sıfırlama e-postaları için kendi SMTP sağlayıcınızı yapılandırın; Supabase varsayılan posta servisini genel kullanım için varsaymayın. Ücretsiz proje durmuşsa önce Resume project ile açın.
5. Vercel'de aynı Supabase projesinin değişkenlerini ve çalışan bir `GOOGLE_GEMINI_API_KEY` tanımlayın, yeni deployment oluşturun. Varsayılan sohbet modeli `gemini-3.5-flash-lite` olur. Supabase ücretsiz katmanı veritabanı/kimlik doğrulama sağlar; model API kullanımı ayrı bir hizmettir ve geçerli anahtar/kota gerektirir.
6. Yerelde `npm run dev`, doğrulama için `npm run type-check`, `npm test -- --runInBand` ve `npm run build` kullanın. Ayrı Playwright projesinin bağımlılıkları kendi klasöründe kurulmalıdır.

## Yanıtlar ve kaynaklar

Gemini ve OpenAI sohbet uçları, son kullanıcı mesajındaki sözcükleri `public.nutricare.drug` ve `active_sub` alanlarında arar; en fazla altı kaydı RLS ile oturum açmış kullanıcı olarak okur ve yanıta kaynak bağlamı ekler. Bu yapı ilaç tablosu için sözcük eşleştirmeli retrieval'dır; mevcut dosya/embedding retrieval akışı ayrıca kullanılabilir. Veritabanına gerçek, gözden geçirilmiş ilaç kayıtları aktarılmalıdır; örnek klinik veri otomatik eklenmez. Eşleşmeyen soru için kaynak uydurulmaz; veritabanı erişim hatası kullanıcıya bildirilir. Gemini/OpenAI dışındaki model sağlayıcılarının eski uçları bu otomatik NutriCare sorgusunu kullanmaz; üretimde varsayılan Gemini yolunu kullanın.

Asistan eczacılık/klinik yaklaşımıyla bilgi verir, gerçek sağlık profesyoneli olduğunu iddia etmez ve kişiye özel reçete/doz değişikliği yapmaz. Klinik kullanıma açmadan önce içerik ve kaynakların yetkin sağlık profesyonellerince değerlendirilmesi gerekir.

## Üretim kontrolü

- Yeni e-posta ile kayıt, gerekiyorsa e-posta onayı, giriş ve ana sohbet alanına yönlendirme.
- Hatalı şifre ve süresi dolmuş onay bağlantısında anlaşılır hata.
- Şifre sıfırlama bağlantısının parola ekranına ulaşması.
- İlaç adı/etken madde sorusunda kayıt kimliğiyle kaynaklı yanıt; eşleşme yoksa açık bildirim.
- Çıkış sonrası giriş, sayfa yenilemesi ve süresi dolan oturumun yenilenmesi.

---

# Chatbot UI

The open-source AI chat app for everyone.

<img src="./public/readme/screenshot.png" alt="Chatbot UI" width="600">

## Demo

View the latest demo [here](https://x.com/mckaywrigley/status/1738273242283151777?s=20).

## Updates

Hey everyone! I've heard your feedback and am working hard on a big update.

Things like simpler deployment, better backend compatibility, and improved mobile layouts are on their way.

Be back soon.

-- Mckay

## Official Hosted Version

Use Chatbot UI without having to host it yourself!

Find the official hosted version of Chatbot UI [here](https://chatbotui.com).

## Sponsor

If you find Chatbot UI useful, please consider [sponsoring](https://github.com/sponsors/mckaywrigley) me to support my open-source work :)

## Issues

We restrict "Issues" to actual issues related to the codebase.

We're getting excessive amounts of issues that amount to things like feature requests, cloud provider issues, etc.

If you are having issues with things like setup, please refer to the "Help" section in the "Discussions" tab above.

Issues unrelated to the codebase will likely be closed immediately.

## Discussions

We highly encourage you to participate in the "Discussions" tab above!

Discussions are a great place to ask questions, share ideas, and get help.

Odds are if you have a question, someone else has the same question.

## Legacy Code

Chatbot UI was recently updated to its 2.0 version.

The code for 1.0 can be found on the `legacy` branch.

## Updating

In your terminal at the root of your local Chatbot UI repository, run:

```bash
npm run update
```

If you run a hosted instance you'll also need to run:

```bash
npm run db-push
```

to apply the latest migrations to your live database.

## Local Quickstart

Follow these steps to get your own Chatbot UI instance running locally.

You can watch the full video tutorial [here](https://www.youtube.com/watch?v=9Qq3-7-HNgw).

### 1. Clone the Repo

```bash
git clone https://github.com/mckaywrigley/chatbot-ui.git
```

### 2. Install Dependencies

Open a terminal in the root directory of your local Chatbot UI repository and run:

```bash
npm install
```

### 3. Install Supabase & Run Locally

#### Why Supabase?

Previously, we used local browser storage to store data. However, this was not a good solution for a few reasons:

- Security issues
- Limited storage
- Limits multi-modal use cases

We now use Supabase because it's easy to use, it's open-source, it's Postgres, and it has a free tier for hosted instances.

We will support other providers in the future to give you more options.

#### 1. Install Docker

You will need to install Docker to run Supabase locally. You can download it [here](https://docs.docker.com/get-docker) for free.

#### 2. Install Supabase CLI

**MacOS/Linux**

```bash
brew install supabase/tap/supabase
```

**Windows**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 3. Start Supabase

In your terminal at the root of your local Chatbot UI repository, run:

```bash
supabase start
```

### 4. Fill in Secrets

#### 1. Environment Variables

In your terminal at the root of your local Chatbot UI repository, run:

```bash
cp .env.local.example .env.local
```

Get the required values by running:

```bash
supabase status
```

Note: Use `API URL` from `supabase status` for `NEXT_PUBLIC_SUPABASE_URL`

Now go to your `.env.local` file and fill in the values.

If the environment variable is set, it will disable the input in the user settings.

#### 2. SQL Setup

In the 1st migration file `supabase/migrations/20240108234540_setup.sql` you will need to replace 2 values with the values you got above:

- `project_url` (line 53): `http://supabase_kong_chatbotui:8000` (default) can remain unchanged if you don't change your `project_id` in the `config.toml` file
- `service_role_key` (line 54): You got this value from running `supabase status`

This prevents issues with storage files not being deleted properly.

### 5. Install Ollama (optional for local models)

Follow the instructions [here](https://github.com/jmorganca/ollama#macos).

### 6. Run app locally

In your terminal at the root of your local Chatbot UI repository, run:

```bash
npm run chat
```

Your local instance of Chatbot UI should now be running at [http://localhost:3000](http://localhost:3000). Be sure to use a compatible node version (i.e. v18).

You can view your backend GUI at [http://localhost:54323/project/default/editor](http://localhost:54323/project/default/editor).

## Hosted Quickstart

Follow these steps to get your own Chatbot UI instance running in the cloud.

Video tutorial coming soon.

### 1. Follow Local Quickstart

Repeat steps 1-4 in "Local Quickstart" above.

You will want separate repositories for your local and hosted instances.

Create a new repository for your hosted instance of Chatbot UI on GitHub and push your code to it.

### 2. Setup Backend with Supabase

#### 1. Create a new project

Go to [Supabase](https://supabase.com/) and create a new project.

#### 2. Get Project Values

Once you are in the project dashboard, click on the "Project Settings" icon tab on the far bottom left.

Here you will get the values for the following environment variables:

- `Project Ref`: Found in "General settings" as "Reference ID"

- `Project ID`: Found in the URL of your project dashboard (Ex: https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>/settings/general)

While still in "Settings" click on the "API" text tab on the left.

Here you will get the values for the following environment variables:

- `Project URL`: Found in "API Settings" as "Project URL"

- `Anon key`: Found in "Project API keys" as "anon public"

- `Service role key`: Found in "Project API keys" as "service_role" (Reminder: Treat this like a password!)

#### 3. Configure Auth

Next, click on the "Authentication" icon tab on the far left.

In the text tabs, click on "Providers" and make sure "Email" is enabled.

We recommend turning off "Confirm email" for your own personal instance.

#### 4. Connect to Hosted DB

Open up your repository for your hosted instance of Chatbot UI.

In the 1st migration file `supabase/migrations/20240108234540_setup.sql` you will need to replace 2 values with the values you got above:

- `project_url` (line 53): Use the `Project URL` value from above
- `service_role_key` (line 54): Use the `Service role key` value from above

Now, open a terminal in the root directory of your local Chatbot UI repository. We will execute a few commands here.

Login to Supabase by running:

```bash
supabase login
```

Next, link your project by running the following command with the "Project ID" you got above:

```bash
supabase link --project-ref <project-id>
```

Your project should now be linked.

Finally, push your database to Supabase by running:

```bash
supabase db push
```

Your hosted database should now be set up!

### 3. Setup Frontend with Vercel

Go to [Vercel](https://vercel.com/) and create a new project.

In the setup page, import your GitHub repository for your hosted instance of Chatbot UI. Within the project Settings, in the "Build & Development Settings" section, switch Framework Preset to "Next.js".

In environment variables, add the following from the values you got above:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_OLLAMA_URL` (only needed when using local Ollama models; default: `http://localhost:11434`)

You can also add API keys as environment variables.

- `OPENAI_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_GPT_45_VISION_NAME`

For the full list of environment variables, refer to the '.env.local.example' file. If the environment variables are set for API keys, it will disable the input in the user settings.

Click "Deploy" and wait for your frontend to deploy.

Once deployed, you should be able to use your hosted instance of Chatbot UI via the URL Vercel gives you.

## Contributing

We are working on a guide for contributing.

## Contact

Message Mckay on [Twitter/X](https://twitter.com/mckaywrigley)

### Besin etkileşimleri ve e-posta doğrulaması

- `supabase db push` ile `20261031000000_food_interactions.sql` migration'ını hedef projeye uygulayın. Mevcut ilaç kayıtları korunur; besinler ayrı `food_interactions` tablosuna alınır. Excel'in 159 satırındaki tüm kaynak alanları korunmuştur. Veri setinde Muz/Banana yoktur; arama olmayan kayıt üretmez.
- Yeni bir Excel için: `python3 scripts/import-food-interactions.py /path/to/data.xlsx /path/to/new_migration.sql`. Satır kimlikleri içerikten türetilir; aynı veri tekrar eklenmez. Kaynak güncellemeleri yeni satır sayılır, eski kayıtları otomatik silmez. Tablo/politika oluşturma bölümü yalnız ilk kurulum içindir.
- Yerel e-posta onayı `supabase/config.toml` içinde açıktır. Yerel Supabase'i yeniden başlatın; doğrulama postalarını yerel e-posta görüntüleyicisinde kontrol edin.
- Hosted Supabase için Authentication > Email altında **Confirm email** ayarını ayrıca açın. `config.toml` hosted Auth ayarını değiştirmez. Authentication > URL Configuration içinde Site URL'yi uygulamanın HTTPS adresine ayarlayın; `/auth/callback` ve `/auth/callback?next=/login/password` adreslerini redirect allowlist'e ekleyin. Gerçek e-posta teslimatı için SMTP yapılandırın.
- E-posta şablonlarında varsayılan `{{ .ConfirmationURL }}` kullanılabilir. Farklı tarayıcıda doğrulama için signup şablonunda `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email` kullanılabilir. Recovery şablonu için `type=recovery` kullanın. Bağlantılar tek kullanımlıktır.
- Kayıttan sonra kullanıcı onay postasını açar. Onaylanmamış hesap giriş yapamaz; giriş ekranından yeni onay postası isteyebilir. Bu akış her girişte ikinci bir kod istemez; kayıt e-postasının doğrulanmasını şart koşar.

Supabase belgeleri: [Email confirmations and SMTP](https://supabase.com/docs/guides/auth/passwords), [resend](https://supabase.com/docs/reference/javascript/auth-resend).

### Mobil arama ve yapılandırılmış klinik RAG

Arama düğmesi sohbet giriş alanının üstünde tüm ekran boyutlarında görünür. Dar ekranda sidebar başlangıçta kapalıdır; giriş alanı ekran genişliğine sığar.

Gemini sohbet akışı: son soru ve en fazla üç önceki kullanıcı sorusundan besin/ilaç adları JSON olarak çıkarılır; Zod doğrulamasından sonra resmi MCP SDK istemcisi, aynı sunucu işlemi içindeki `InMemoryTransport` üzerinden `search_clinical_records` aracını çağırır. Her isteğin MCP sunucusu o kullanıcının Supabase oturumuna bağlıdır; RLS korunur. Dışarıya açık bir MCP endpoint'i veya SQL çalıştırma aracı yoktur.

Araç `food_interactions` içinde besin/Latince adlarını ve ilaç etkileşimlerini, `nutricare` içinde ilaç ve etken maddeyi arar. Eşleşen satırların tüm alanları 200'lük sayfalarla alınır. 2.000 satırı veya 120.000 karakteri aşan kaynaklar sessizce kırpılmaz; kullanıcıdan soruyu daraltması istenir. Çıkarım başarısızsa son soruda sözcük tabanlı arama yapılır ve bu sınırlama modele bildirilir. Veritabanı hatasında kaynak yokmuş gibi yanıt üretilmez.

Bu, SQL satırlarından yapılan structured RAG'dir; vektör embedding gerektirmez. Yanıt modeline kaynaklar ve kayıt kimlikleri verilir. Klinik prompt bilinmeyen/belirsiz bilgiyi açıkça belirtip hekime başvurmayı önermeyi zorunlu kılar; sistem kendisini ruhsatlı sağlık profesyoneli olarak tanıtmaz. Sohbet endpoint'i MCP SDK uyumluluğu için Node.js runtime kullanır ve 60 saniye süre sınırına sahiptir.
