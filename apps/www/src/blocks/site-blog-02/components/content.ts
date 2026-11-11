// Sample content for "cold path", a fictional independent engineering blog.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Authors, posts,
// numbers and addresses are invented. Code samples are illustrative.
import { blockLabelsTr, pickLocale, sitePageHref, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };

export const BRAND = "cold path";
export const EMAIL = "editors@example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  return {
    t,
    intl,
    f: createFormatter(intl, { timeZone: "Europe/Istanbul" }),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const blogPages = ["home", "post", "archive"];
export const POST_HREF = sitePageHref("post");
export const ARCHIVE_HREF = sitePageHref("archive");
/** The archive filtered by one tag. */
export const tagHref = (tag: string) => sitePageHref("archive", `tag-${tag}`);

/* Authors ---------------------------------------------------------------- */

export interface Author {
  id: string;
  name: string;
  handle: string;
  role: L;
  bio: L;
}

export const authors: Record<string, Author> = {
  deniz: {
    id: "deniz",
    name: "Deniz Aksoy",
    handle: "@deniz",
    role: { en: "Staff engineer, payments infrastructure", tr: "Kıdemli mühendis, ödeme altyapısı" },
    bio: {
      en: "Runs the queue that moves money between ledgers. Has opinions about retries and keeps a list of every incident since 2019.",
      tr: "Defterler arasında para taşıyan kuyruğu yönetiyor. Yeniden denemeler hakkında fikirleri var ve 2019’dan beri her olayın listesini tutuyor.",
    },
  },
  mira: {
    id: "mira",
    name: "Mira Lindqvist",
    handle: "@mira",
    role: { en: "Database reliability engineer", tr: "Veritabanı güvenilirlik mühendisi" },
    bio: {
      en: "Reads query plans for fun. Spent four years keeping a 9 TB Postgres cluster boring.",
      tr: "Sorgu planlarını keyif için okuyor. 9 TB’lık bir Postgres kümesini dört yıl boyunca sıkıcı tutmayı başardı.",
    },
  },
  tomas: {
    id: "tomas",
    name: "Tomas Reiher",
    handle: "@tomas",
    role: { en: "SRE, network edge", tr: "SRE, ağ kenarı" },
    bio: {
      en: "Owns the load balancers and, therefore, most of the blame. Writes the incident reviews on this blog.",
      tr: "Yük dengeleyicilerin ve dolayısıyla suçun çoğunun sahibi. Bu blogdaki olay incelemelerini o yazıyor.",
    },
  },
  selin: {
    id: "selin",
    name: "Selin Varol",
    handle: "@selin",
    role: { en: "Platform engineer, developer tooling", tr: "Platform mühendisi, geliştirici araçları" },
    bio: {
      en: "Builds the deploy pipeline and the flags service. Believes every log line should answer one question.",
      tr: "Dağıtım hattını ve bayrak servisini geliştiriyor. Her log satırının tek bir soruyu yanıtlaması gerektiğine inanıyor.",
    },
  },
};

/* Tags --------------------------------------------------------------------- */

export const tags = ["postgres", "queues", "reliability", "distributed", "observability", "incidents", "networking", "migrations"] as const;
export type Tag = (typeof tags)[number];

/* Posts -------------------------------------------------------------------- */

export interface Post {
  slug: string;
  title: L;
  excerpt: L;
  date: string;
  minutes: number;
  author: string;
  tags: Tag[];
  /** The post with a full article page in this demo. */
  featured?: boolean;
}

export const posts: Post[] = [
  {
    slug: "exactly-once-is-a-lie",
    title: { en: "Exactly-once is a lie: an idempotent job queue on Postgres", tr: "Tam-bir-kez bir yalan: Postgres üzerinde idempotent bir iş kuyruğu" },
    excerpt: {
      en: "We replaced a broker with one table, a unique index and SKIP LOCKED. What we gave up, what we got back, and the numbers after six months.",
      tr: "Bir mesaj aracısını tek tablo, bir benzersiz indeks ve SKIP LOCKED ile değiştirdik. Neden vazgeçtik, ne kazandık ve altı ay sonraki rakamlar.",
    },
    date: "2026-10-28",
    minutes: 14,
    author: "deniz",
    tags: ["postgres", "queues", "reliability"],
    featured: true,
  },
  {
    slug: "explain-analyze-buffers",
    title: { en: "Reading EXPLAIN (ANALYZE, BUFFERS) without guessing", tr: "EXPLAIN (ANALYZE, BUFFERS) çıktısını tahmin etmeden okumak" },
    excerpt: { en: "Shared hits, reads and the one line that tells you the planner was wrong.", tr: "Paylaşılan isabetler, okumalar ve planlayıcının yanıldığını söyleyen tek satır." },
    date: "2026-10-09",
    minutes: 11,
    author: "mira",
    tags: ["postgres", "observability"],
  },
  {
    slug: "our-p99-was-dns",
    title: { en: "Our p99 was a DNS problem", tr: "p99 gecikmemiz bir DNS sorunuydu" },
    excerpt: { en: "Incident review: 41 minutes of 2-second tails, a resolver with a 5-second timeout and ndots:5.", tr: "Olay incelemesi: 41 dakika süren 2 saniyelik kuyruklar, 5 saniye zaman aşımlı bir çözücü ve ndots:5." },
    date: "2026-09-17",
    minutes: 8,
    author: "tomas",
    tags: ["incidents", "networking"],
  },
  {
    slug: "backpressure-kitchen-sink",
    title: { en: "Backpressure, explained with a kitchen sink", tr: "Geri basınç, bir mutfak lavabosuyla anlatıldı" },
    excerpt: { en: "Bounded queues, load shedding and why an unbounded buffer is just a slower outage.", tr: "Sınırlı kuyruklar, yük atma ve sınırsız bir tamponun neden yalnızca daha yavaş bir kesinti olduğu." },
    date: "2026-08-26",
    minutes: 9,
    author: "deniz",
    tags: ["queues", "distributed"],
  },
  {
    slug: "cost-of-a-retry",
    title: { en: "The cost of a retry: budgets, jitter and the thundering herd", tr: "Bir yeniden denemenin bedeli: bütçeler, jitter ve sürü etkisi" },
    excerpt: { en: "A 10% retry budget saved us more than any timeout tuning ever did.", tr: "%10’luk bir yeniden deneme bütçesi bize hiçbir zaman aşımı ayarının sağlamadığı kadar kazandırdı." },
    date: "2026-07-30",
    minutes: 12,
    author: "tomas",
    tags: ["reliability", "distributed"],
  },
  {
    slug: "zero-downtime-renames",
    title: { en: "Zero-downtime column renames in four deploys", tr: "Dört dağıtımda kesintisiz sütun yeniden adlandırma" },
    excerpt: { en: "Expand, dual-write, backfill, contract — with the exact migrations we ran.", tr: "Genişlet, çift yaz, geri doldur, daralt — çalıştırdığımız göçlerin tam hâliyle." },
    date: "2026-07-08",
    minutes: 7,
    author: "mira",
    tags: ["postgres", "migrations"],
  },
  {
    slug: "structured-logs-grep",
    title: { en: "Structured logs you can actually grep", tr: "Gerçekten grep’leyebileceğiniz yapılandırılmış loglar" },
    excerpt: { en: "One event per line, stable keys, and why we stopped logging stack traces at INFO.", tr: "Satır başına tek olay, sabit anahtarlar ve INFO seviyesinde yığın izi yazmayı neden bıraktık." },
    date: "2026-06-12",
    minutes: 6,
    author: "selin",
    tags: ["observability"],
  },
  {
    slug: "flags-are-distributed",
    title: { en: "Feature flags are a distributed system", tr: "Özellik bayrakları dağıtık bir sistemdir" },
    excerpt: { en: "Stale caches, partial rollouts and the flag that turned itself back on.", tr: "Eskimiş önbellekler, kısmi yayınlar ve kendini yeniden açan bayrak." },
    date: "2026-05-21",
    minutes: 10,
    author: "selin",
    tags: ["reliability", "distributed"],
  },
  {
    slug: "clock-skew-leases",
    title: { en: "Clock skew ate our leases", tr: "Saat kayması kiralamalarımızı yedi" },
    excerpt: { en: "Two workers, one job, 380 ms of drift. Fencing tokens, explained by the bug that taught us.", tr: "İki işçi, bir iş, 380 ms kayma. Çit belirteçleri, bize öğreten hata üzerinden." },
    date: "2026-04-02",
    minutes: 13,
    author: "deniz",
    tags: ["distributed", "incidents"],
  },
  {
    slug: "on-call-notes-2025",
    title: { en: "A year of on-call notes, compressed", tr: "Bir yıllık nöbet notları, sıkıştırılmış hâlde" },
    excerpt: { en: "112 pages, 9 real incidents, and the three alerts we deleted first.", tr: "112 çağrı, 9 gerçek olay ve ilk sildiğimiz üç alarm." },
    date: "2025-12-03",
    minutes: 15,
    author: "tomas",
    tags: ["incidents", "observability"],
  },
  {
    slug: "advisory-locks",
    title: { en: "Advisory locks are not a mutex", tr: "Danışma kilitleri bir mutex değildir" },
    excerpt: { en: "Session vs transaction scope, PgBouncer in transaction mode, and a lock nobody released.", tr: "Oturum ve işlem kapsamı, işlem modunda PgBouncer ve kimsenin bırakmadığı bir kilit." },
    date: "2025-10-15",
    minutes: 9,
    author: "mira",
    tags: ["postgres", "distributed"],
  },
  {
    slug: "wal-for-app-devs",
    title: { en: "Write-ahead logs for application developers", tr: "Uygulama geliştiricileri için önceden yazma günlükleri" },
    excerpt: { en: "What fsync promises, what it doesn’t, and how replicas fall behind.", tr: "fsync neyi vaat eder, neyi etmez ve replikalar nasıl geride kalır." },
    date: "2025-08-20",
    minutes: 16,
    author: "mira",
    tags: ["postgres", "reliability"],
  },
];

export const featured = posts.find((p) => p.featured)!;

/** Number of posts per tag, most-used first. */
export const tagCounts = tags
  .map((tag) => ({ tag, count: posts.filter((p) => p.tags.includes(tag)).length }))
  .sort((a, b) => b.count - a.count);

/* The featured article ------------------------------------------------------- */

export type CodeLang = "go" | "rust" | "ts";
export const codeLangs: { id: CodeLang; label: string; file: string }[] = [
  { id: "go", label: "Go", file: "queue.go" },
  { id: "rust", label: "Rust", file: "queue.rs" },
  { id: "ts", label: "TypeScript", file: "queue.ts" },
];

export type ArticleNode =
  | { type: "p"; text: L }
  | { type: "h2"; id: string; text: L }
  | { type: "code"; samples: Record<CodeLang, string>; caption?: L }
  | { type: "sql"; file: string; code: string; caption?: L }
  | { type: "note"; title: L; text: L }
  | { type: "list"; items: L[] }
  | { type: "bench"; caption: L };

export const benchmark = [
  { workers: 4, rate: 1_840, p50: 3.1, p99: 11.8 },
  { workers: 16, rate: 6_920, p50: 3.4, p99: 14.2 },
  { workers: 64, rate: 21_300, p50: 4.9, p99: 27.5 },
  { workers: 128, rate: 23_100, p50: 9.7, p99: 61.0 },
];

export const article: ArticleNode[] = [
  {
    type: "p",
    text: {
      en: "For three years our payouts ran on a message broker that promised exactly-once delivery. It did not deliver exactly once. Nothing does: a network can always fail after the work is done and before the acknowledgement arrives. What you can have is at-least-once delivery and an operation that is safe to repeat.",
      tr: "Üç yıl boyunca ödemelerimiz tam-bir-kez teslimat vaat eden bir mesaj aracısı üzerinde çalıştı. Tam bir kez teslim etmedi. Hiçbir şey etmez: ağ, iş bittikten sonra ve onay gelmeden önce her zaman kopabilir. Elde edebileceğiniz şey en-az-bir-kez teslimat ve tekrarlanması güvenli bir işlemdir.",
    },
  },
  {
    type: "note",
    title: { en: "TL;DR", tr: "Kısaca" },
    text: {
      en: "One jobs table with a unique (queue, idem_key) index, workers that claim batches with FOR UPDATE SKIP LOCKED, and side effects committed in the same transaction as the job. 23k jobs/s on one primary; zero duplicate payouts since April.",
      tr: "Benzersiz (queue, idem_key) indeksli tek bir jobs tablosu, FOR UPDATE SKIP LOCKED ile toplu iş alan işçiler ve işle aynı işlemde kaydedilen yan etkiler. Tek birincil sunucuda saniyede 23 bin iş; nisandan beri sıfır mükerrer ödeme.",
    },
  },
  { type: "h2", id: "the-table", text: { en: "One table, one unique index", tr: "Tek tablo, tek benzersiz indeks" } },
  {
    type: "p",
    text: {
      en: "The whole design rests on the idempotency key. The caller decides it — for a payout it is the payout id — and the database refuses a second row with the same key. A partial index keeps the hot path small: finished jobs drop out of it.",
      tr: "Tüm tasarım idempotency anahtarına dayanıyor. Anahtarı çağıran belirler — bir ödeme için ödeme kimliğidir — ve veritabanı aynı anahtarla ikinci bir satırı reddeder. Kısmi bir indeks sıcak yolu küçük tutar: biten işler indeksten düşer.",
    },
  },
  {
    type: "sql",
    file: "001_jobs.sql",
    code: `create table jobs (
  id           bigint generated always as identity primary key,
  queue        text        not null,
  idem_key     text        not null,
  payload      jsonb       not null,
  run_at       timestamptz not null default now(),
  attempts     int         not null default 0,
  locked_until timestamptz,
  done_at      timestamptz,
  unique (queue, idem_key)
);

-- only unfinished work lives in the hot index
create index jobs_ready on jobs (queue, run_at)
  where done_at is null;`,
  },
  { type: "h2", id: "enqueue", text: { en: "Enqueue: let the index say no", tr: "Kuyruğa ekleme: hayır demeyi indekse bırakın" } },
  {
    type: "p",
    text: {
      en: "Enqueueing is an insert that is allowed to do nothing. If the row already exists we return false and the caller moves on; there is no read-then-write race because there is no read. Pick your language — every sample on this page follows the switch.",
      tr: "Kuyruğa ekleme, hiçbir şey yapmamasına izin verilen bir insert’tür. Satır zaten varsa false döner ve çağıran yoluna devam eder; okuma olmadığı için oku-sonra-yaz yarışı da yoktur. Dilinizi seçin — bu sayfadaki her örnek seçiminizi izler.",
    },
  },
  {
    type: "code",
    caption: { en: "ON CONFLICT DO NOTHING turns a duplicate into a no-op.", tr: "ON CONFLICT DO NOTHING bir mükerreri etkisiz bir işleme çevirir." },
    samples: {
      go: `// Enqueue reports whether a new job was created.
func Enqueue(ctx context.Context, db *pgxpool.Pool, queue, key string, payload any) (bool, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return false, err
	}
	tag, err := db.Exec(ctx, \`
		insert into jobs (queue, idem_key, payload)
		values ($1, $2, $3)
		on conflict (queue, idem_key) do nothing\`, queue, key, body)
	return tag.RowsAffected() == 1, err
}`,
      rust: `/// Returns true when a new job was created.
pub async fn enqueue(db: &PgPool, queue: &str, key: &str, payload: &Value) -> sqlx::Result<bool> {
    let res = sqlx::query(
        "insert into jobs (queue, idem_key, payload)
         values ($1, $2, $3)
         on conflict (queue, idem_key) do nothing",
    )
    .bind(queue)
    .bind(key)
    .bind(payload)
    .execute(db)
    .await?;
    Ok(res.rows_affected() == 1)
}`,
      ts: `// Resolves to true when a new job was created.
export async function enqueue(db: Pool, queue: string, key: string, payload: unknown): Promise<boolean> {
  const res = await db.query(
    \`insert into jobs (queue, idem_key, payload)
     values ($1, $2, $3)
     on conflict (queue, idem_key) do nothing\`,
    [queue, key, JSON.stringify(payload)],
  );
  return res.rowCount === 1;
}`,
    },
  },
  { type: "h2", id: "claim", text: { en: "Claim: SKIP LOCKED does the scheduling", tr: "Alma: zamanlamayı SKIP LOCKED yapar" } },
  {
    type: "p",
    text: {
      en: "Workers claim a batch in one statement. SKIP LOCKED makes concurrent workers step around each other instead of queueing on row locks, and the lease (locked_until) means a crashed worker’s jobs come back after 30 seconds without anyone noticing.",
      tr: "İşçiler bir toplu işi tek ifadeyle alır. SKIP LOCKED eşzamanlı işçilerin satır kilitlerinde sıraya girmek yerine birbirinin etrafından dolaşmasını sağlar; kira süresi (locked_until) sayesinde çöken bir işçinin işleri kimse fark etmeden 30 saniye sonra geri gelir.",
    },
  },
  {
    type: "sql",
    file: "claim.sql",
    code: `update jobs
   set locked_until = now() + interval '30 seconds',
       attempts     = attempts + 1
 where id in (
   select id from jobs
    where queue = $1
      and done_at is null
      and run_at <= now()
      and (locked_until is null or locked_until < now())
    order by run_at
    limit $2
    for update skip locked
 )
returning id, idem_key, payload, attempts;`,
  },
  { type: "h2", id: "complete", text: { en: "Complete in the same transaction", tr: "Aynı işlemde tamamlayın" } },
  {
    type: "p",
    text: {
      en: "This is the part brokers cannot give you. The payout row and the done_at stamp commit together or not at all. If the worker dies between them, the transaction rolls back and the job is simply claimed again.",
      tr: "Bu, mesaj aracılarının size veremeyeceği kısım. Ödeme satırı ve done_at damgası ya birlikte kaydedilir ya da hiç kaydedilmez. İşçi aradaki bir anda ölürse işlem geri alınır ve iş yeniden alınır.",
    },
  },
  {
    type: "code",
    caption: { en: "The side effect and the acknowledgement share one commit.", tr: "Yan etki ve onay tek bir commit’i paylaşır." },
    samples: {
      go: `func Process(ctx context.Context, db *pgxpool.Pool, job Job) error {
	return pgx.BeginFunc(ctx, db, func(tx pgx.Tx) error {
		if err := ledger.Post(ctx, tx, job.Payload); err != nil {
			return err // rolled back; the lease expires and we retry
		}
		_, err := tx.Exec(ctx,
			\`update jobs set done_at = now(), locked_until = null where id = $1\`, job.ID)
		return err
	})
}`,
      rust: `pub async fn process(db: &PgPool, job: Job) -> anyhow::Result<()> {
    let mut tx = db.begin().await?;
    ledger::post(&mut tx, &job.payload).await?; // early return rolls back
    sqlx::query("update jobs set done_at = now(), locked_until = null where id = $1")
        .bind(job.id)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(())
}`,
      ts: `export async function processJob(db: Pool, job: Job): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("begin");
    await ledger.post(client, job.payload);
    await client.query("update jobs set done_at = now(), locked_until = null where id = $1", [job.id]);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback"); // the lease expires and we retry
    throw err;
  } finally {
    client.release();
  }
}`,
    },
  },
  { type: "h2", id: "numbers", text: { en: "The numbers after six months", tr: "Altı ay sonraki rakamlar" } },
  {
    type: "p",
    text: {
      en: "Measured on one primary (16 vCPU, 64 GB, gp3 storage) with jobs that do a single ledger insert. Throughput flattens after 64 workers; past that, the claim query starts waiting on the index rather than on locks.",
      tr: "Tek bir birincil sunucuda (16 vCPU, 64 GB, gp3 depolama), tek bir defter kaydı yapan işlerle ölçüldü. Verim 64 işçiden sonra düzleşiyor; bunun ötesinde alma sorgusu kilitlerden çok indekste beklemeye başlıyor.",
    },
  },
  { type: "bench", caption: { en: "Claim-and-complete throughput by worker count", tr: "İşçi sayısına göre al-ve-tamamla verimi" } },
  {
    type: "list",
    items: [
      { en: "Duplicate payouts since the switch in April: 0 (previously 3–5 a month, all refunded by hand).", tr: "Nisandaki geçişten beri mükerrer ödeme: 0 (önceden ayda 3–5, hepsi elle iade edildi)." },
      { en: "Jobs table size with a nightly purge of rows older than 14 days: 38 GB.", tr: "14 günden eski satırların her gece temizlendiği jobs tablosunun boyutu: 38 GB." },
      { en: "Infrastructure we no longer run: a three-node broker cluster and its on-call rotation.", tr: "Artık çalıştırmadığımız altyapı: üç düğümlü bir mesaj aracısı kümesi ve onun nöbet çizelgesi." },
    ],
  },
  { type: "h2", id: "when-not", text: { en: "When not to do this", tr: "Ne zaman yapmamalı" } },
  {
    type: "p",
    text: {
      en: "If you need fan-out to many consumers, ordering across partitions or more than a few tens of thousands of jobs per second, use a log. A table is a queue for work you must not lose and must not do twice — which, for a payments team, is most of it.",
      tr: "Birçok tüketiciye dağıtım, bölümler arası sıralama ya da saniyede birkaç on binden fazla iş gerekiyorsa bir log kullanın. Tablo, kaybetmemeniz ve iki kez yapmamanız gereken işler için bir kuyruktur — ki bir ödeme ekibi için işin çoğu budur.",
    },
  },
];

/** Headings of the featured article, for the table of contents. */
export const articleToc = article.filter((n): n is Extract<ArticleNode, { type: "h2" }> => n.type === "h2");

/** A short teaser from the featured article for the home page. */
export const teaser = `insert into jobs (queue, idem_key, payload)
values ($1, $2, $3)
on conflict (queue, idem_key) do nothing;`;

/** Posts as rows of the index, localized. In this demo every row opens the featured article. */
export function indexPostsFor(locale: SiteLocale) {
  const { t, f } = copyFor(locale);
  return posts.map((p) => ({
    href: POST_HREF,
    title: t(p.title),
    excerpt: t(p.excerpt),
    iso: p.date,
    date: f.date(p.date, "medium"),
    year: p.date.slice(0, 4),
    minutes: locale === "tr" ? `${p.minutes} dk` : `${p.minutes} min`,
    author: authors[p.author]!.name,
    tags: [...p.tags],
  }));
}

/** Built-in strings of the post index. */
export function indexLabelsFor(locale: SiteLocale) {
  const { t } = copyFor(locale);
  return {
    filter: t({ en: "Filter posts", tr: "Yazıları süz" }),
    filterPlaceholder: t({ en: "Filter by title, tag or author", tr: "Başlık, etiket ya da yazara göre süz" }),
    count: t({ en: "{count} posts", tr: "{count} yazı" }),
    empty: t({ en: "Nothing matches “{query}”.", tr: "“{query}” ile eşleşen yazı yok." }),
    clear: t({ en: "Clear filter", tr: "Süzgeci temizle" }),
    allTags: t({ en: "all", tr: "tümü" }),
    tags: t({ en: "Tags", tr: "Etiketler" }),
    keys: t({ en: "Keyboard shortcuts", tr: "Klavye kısayolları" }),
    focus: t({ en: "filter", tr: "süz" }),
    move: t({ en: "move", tr: "gezin" }),
    open: t({ en: "open", tr: "aç" }),
    list: t({ en: "Posts", tr: "Yazılar" }),
  };
}

export function codeLabelsFor(locale: SiteLocale) {
  const { t } = copyFor(locale);
  return {
    copy: t({ en: "Copy code", tr: "Kodu kopyala" }),
    copied: t({ en: "Copied", tr: "Kopyalandı" }),
    codeIn: t({ en: "Code in {lang}", tr: "{lang} kodu" }),
    languages: t({ en: "Code language", tr: "Kod dili" }),
  };
}

export function subscribeLabelsFor(locale: SiteLocale) {
  const { t } = copyFor(locale);
  return {
    email: t({ en: "Email address", tr: "E-posta adresi" }),
    placeholder: "you@example.com",
    submit: t({ en: "Subscribe", tr: "Abone ol" }),
    invalid: t({ en: "That doesn’t look like an email address.", tr: "Bu bir e-posta adresine benzemiyor." }),
    done: t({ en: "Check {email} for a confirmation link.", tr: "Onay bağlantısı için {email} adresini kontrol edin." }),
    hint: t({ en: "One email a month. Unsubscribe from any issue.", tr: "Ayda bir e-posta. Her e-postadan aboneliği bırakabilirsiniz." }),
  };
}
