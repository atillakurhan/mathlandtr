export type Lang = "tr" | "de";
export type ClassLevel = 3 | 8;

type Dict = Record<string, { tr: string; de: string }>;

export const dict: Dict = {
  app_title: { tr: "Matematik Arena", de: "Mathe-Arena" },
  app_tag: {
    tr: "8. sınıf matematiğini eğlenceli oyunlarla pekiştir — Realschule müfredatına uygun.",
    de: "Mathe der Klasse 8 spielerisch üben — passend zum Realschul-Lehrplan.",
  },
  start_playing: { tr: "Hemen Oyna", de: "Jetzt Spielen" },
  leaderboard: { tr: "Liderlik Tablosu", de: "Bestenliste" },
  teacher_panel: { tr: "Öğretmen Paneli", de: "Lehrerbereich" },
  login: { tr: "Giriş", de: "Anmelden" },
  logout: { tr: "Çıkış", de: "Abmelden" },
  email: { tr: "E-posta", de: "E-Mail" },
  password: { tr: "Şifre", de: "Passwort" },
  signup: { tr: "Hesap Oluştur", de: "Registrieren" },
  display_name: { tr: "Ad Soyad", de: "Anzeigename" },
  class_3: { tr: "3. Sınıf", de: "Klasse 3" },
  class_8: { tr: "8. Sınıf · Realschule", de: "Klasse 8 · Realschule" },
  difficulty: { tr: "Zorluk", de: "Schwierigkeit" },
  easy: { tr: "Kolay", de: "Leicht" },
  medium: { tr: "Orta", de: "Mittel" },
  hard: { tr: "Zor", de: "Schwer" },
  locked: { tr: "Kilitli", de: "Gesperrt" },
  unlock_hint: { tr: "{n} puan kazan kilidi aç", de: "Hol {n} Punkte zum Freischalten" },
  questions: { tr: "Sorular", de: "Fragen" },
  add_question: { tr: "Soru Ekle", de: "Frage hinzufügen" },
  prompt: { tr: "Soru", de: "Aufgabe" },
  answer: { tr: "Cevap", de: "Antwort" },
  delete: { tr: "Sil", de: "Löschen" },
  save: { tr: "Kaydet", de: "Speichern" },
  cancel: { tr: "İptal", de: "Abbrechen" },
  settings: { tr: "Ayarlar", de: "Einstellungen" },
  active_class: { tr: "Aktif Sınıf", de: "Aktive Klasse" },
  unlock_thresholds: { tr: "Kilit Açma Eşikleri", de: "Freischalt-Schwellen" },
  player_name: { tr: "Oyuncu Adı", de: "Spielername" },
  start_game: { tr: "Oyuna Başla", de: "Spiel starten" },
  score: { tr: "Skor", de: "Punkte" },
  level: { tr: "Seviye", de: "Stufe" },
  play_again: { tr: "Tekrar Oyna", de: "Nochmal" },
  back_home: { tr: "Ana Sayfa", de: "Startseite" },
  correct: { tr: "Doğru!", de: "Richtig!" },
  wrong: { tr: "Yanlış", de: "Falsch" },
  no_questions: {
    tr: "Bu oyun için soru bulunamadı. Öğretmen panelinden ekleyin.",
    de: "Keine Fragen vorhanden. Bitte im Lehrerbereich hinzufügen.",
  },
  language: { tr: "Dil", de: "Sprache" },
  // ── Games (Klasse 8 only) ───────────────────────────────────────────────────
  g_archery_name: { tr: "Denklem Okçusu",      de: "Gleichungs-Bogenschütze" },
  g_archery_desc: {
    tr: "Doğru cevabı taşıyan balonu vur.",
    de: "Triff den Ballon mit der richtigen Lösung.",
  },
  g_mathpoly_name: { tr: "Matematik Krallığı", de: "Mathe-Königreich" },
  g_mathpoly_desc: {
    tr: "Zar at, kareleri keşfet, denklemleri çöz.",
    de: "Würfle, erkunde Felder und löse Gleichungen.",
  },
  g_goalie_name: { tr: "Parabol Mancınığı",    de: "Parabel-Katapult" },
  g_goalie_desc: {
    tr: "a, b, c değerlerini ayarla, hedefi vur.",
    de: "Stelle a, b, c ein und triff das Ziel.",
  },
  g_pyramid_name: { tr: "Sayı Piramidi",       de: "Zahlenpyramide" },
  g_pyramid_desc: {
    tr: "Komşu sayıları toplayarak piramidi tamamla.",
    de: "Addiere die Nachbarn und vervollständige die Pyramide.",
  },
  g_racer_name: { tr: "Matematik Yarışı",      de: "Mathe-Rennen" },
  g_racer_desc: {
    tr: "Süre dolmadan doğru cevapla geç.",
    de: "Beantworte Aufgaben, bevor die Zeit abläuft.",
  },
  g_market_name: { tr: "Süpermarket Hesabı",   de: "Super-Markt" },
  g_market_desc: {
    tr: "Yüzde, KDV ve faiz hesapla.",
    de: "Prozent, Mehrwertsteuer und Zinsen berechnen.",
  },

  // ── Gamification ────────────────────────────────────────────────────────────
  xp:             { tr: "XP",             de: "XP" },
  coins:          { tr: "Münzen",         de: "Münzen" },
  streak:         { tr: "Seri",           de: "Streak" },
  streak_days:    { tr: "{n} gün serisi", de: "{n}-Tage-Streak" },
  streak_freeze:  { tr: "Telafi günü kullanıldı", de: "Freeze verwendet" },
  level_up:       { tr: "Seviye atladın!", de: "Level Up!" },
  coin_reward:    { tr: "+{n} Münzen!",  de: "+{n} Münzen!" },
  // ── Character shop ──────────────────────────────────────────────────────────
  shop:           { tr: "Karakter Dükkanı",  de: "Charakter-Shop" },
  buy_char:       { tr: "Satın Al",          de: "Kaufen" },
  equip_companion:{ tr: "Arkadaş Yap",       de: "Als Begleiter wählen" },
  already_owned:  { tr: "Zaten sahipsin",    de: "Bereits erworben" },
  not_enough_coins:{ tr: "Yetersiz Münzen",  de: "Nicht genug Münzen" },
  your_companion: { tr: "Arkadaşın",         de: "Dein Begleiter" },
  char_ability:   { tr: "Özellik",           de: "Fähigkeit" },
  free_starter:   { tr: "Ücretsiz Başlangıç",de: "Kostenlos – Startcharakter" },
  // ── Wardrobe ────────────────────────────────────────────────────────────────
  wardrobe:       { tr: "Gardırop",          de: "Kleiderschrank" },
  slot_hat:       { tr: "Şapka",             de: "Hut" },
  slot_glasses:   { tr: "Gözlük",            de: "Brille" },
  slot_outfit:    { tr: "Kıyafet",           de: "Outfit" },
  slot_accessory: { tr: "Aksesuar",          de: "Accessoire" },
  unlock_with_streak:{ tr: "{n} gün serisinde açılır", de: "Freischalten bei {n}-Tage-Streak" },
  get_free:       { tr: "Al",                de: "Holen" },
  buy_item:       { tr: "Satın Al",          de: "Kaufen" },
  gratis:         { tr: "Ücretsiz",          de: "Gratis" },
  equipped:       { tr: "Giyildi ✓",         de: "Ausgerüstet ✓" },
  equip:          { tr: "Giyin",             de: "Anlegen" },
  streak_bonus:   { tr: "🔥 {n} Günlük Seri! +{coins} 🪙 bonus!", de: "🔥 {n}-Tage-Streak! +{coins} 🪙 Bonus!" },
  // ── Classroom ───────────────────────────────────────────────────────────────
  classroom:      { tr: "Sınıfım",           de: "Meine Klasse" },
  create_class:   { tr: "Sınıf Oluştur",     de: "Klasse erstellen" },
  join_class:     { tr: "Sınıfa Katıl",      de: "Klasse beitreten" },
  invite_code:    { tr: "Davet Kodu",        de: "Einladungscode" },
  class_name:     { tr: "Sınıf Adı",         de: "Klassenname" },
  students:       { tr: "Öğrenciler",        de: "Schüler" },
  no_classroom:   { tr: "Henüz bir sınıfa bağlı değilsin.", de: "Du bist noch keiner Klasse beigetreten." },
  class_joined:   { tr: "Sınıfa katıldın!",  de: "Du bist der Klasse beigetreten!" },
  class_created:  { tr: "Sınıf oluşturuldu!", de: "Klasse erstellt!" },
  invalid_code:   { tr: "Geçersiz davet kodu.", de: "Ungültiger Einladungscode." },
  your_invite_code:{ tr: "Davet Kodun",      de: "Dein Einladungscode" },
  // ── Registration (student) ──────────────────────────────────────────────────
  register_student:{ tr: "Öğrenci Kaydı",   de: "Schüler-Registrierung" },
  register_teacher:{ tr: "Öğretmen Kaydı",  de: "Lehrer-Registrierung" },
  i_am_student:   { tr: "Öğrenciyim",       de: "Ich bin Schüler/in" },
  i_am_teacher:   { tr: "Öğretmenim",       de: "Ich bin Lehrer/in" },
  optional_code:  { tr: "Davet kodu (isteğe bağlı)", de: "Einladungscode (optional)" },
  finished: { tr: "Bitti!", de: "Fertig!" },
  high_score: { tr: "En Yüksek", de: "Rekord" },
  time_left: { tr: "Süre", de: "Zeit" },
  enter_name: { tr: "Adını yaz ve başla", de: "Name eingeben und starten" },
  no_account: { tr: "Hesabın yok mu?", de: "Noch kein Konto?" },
  have_account: { tr: "Zaten hesabın var mı?", de: "Schon registriert?" },
  teacher_only: {
    tr: "Bu bölüm yalnızca öğretmenler içindir.",
    de: "Dieser Bereich ist nur für Lehrer.",
  },
  game: { tr: "Oyun", de: "Spiel" },
  locale_of_q: { tr: "Soru dili", de: "Sprache der Frage" },
  manage: { tr: "Yönet", de: "Verwalten" },
  total_score: { tr: "Toplam", de: "Gesamt" },
  no_scores: { tr: "Henüz skor yok.", de: "Noch keine Punkte." },
  empty_pool_hint: {
    tr: "Soru havuzu boş — varsayılan örnek sorular kullanılıyor.",
    de: "Fragenpool leer — Standardbeispiele werden verwendet.",
  },
  // Kid-friendly encouragement
  cheer_great:    { tr: "Harikasın! 🌟", de: "Super! 🌟" },
  cheer_nice:     { tr: "Aferin sana!", de: "Toll gemacht!" },
  cheer_smart:    { tr: "Çok zekisin!", de: "Sehr clever!" },
  cheer_keep:     { tr: "Devam et böyle!", de: "Weiter so!" },
  cheer_oops:     { tr: "Boş ver, tekrar dene!", de: "Kein Problem, nochmal!" },
  cheer_almost:   { tr: "Az kaldı, dene!", de: "Fast geschafft!" },
  cheer_try:      { tr: "Düşün ve tekrar dene", de: "Denk nach und versuch's nochmal" },
  the_answer_was: { tr: "Doğrusu", de: "Richtig wäre" },
  combo:          { tr: "Üst üste {n}!", de: "{n} in Folge!" },
  sound_on:       { tr: "Ses açık", de: "Ton an" },
  sound_off:      { tr: "Ses kapalı", de: "Ton aus" },
  // Game-specific UI strings
  shoot_ball:       { tr: "⚽ Vur!", de: "⚽ Schießen!" },
  pyramid_hint_3:   { tr: "Alttaki sayıları topla, üst kareye yaz", de: "Addiere die Nachbarn und schreibe das Ergebnis oben hin" },
  pyramid_hint_8:   { tr: "Alt komşuları topla, üste yaz", de: "Summiere die Nachbarn nach oben" },
  adventure_board:  { tr: "Macera Tahtası", de: "Abenteuerbrett" },
  roll_dice:        { tr: "Zar At", de: "Würfeln" },
  rolling:          { tr: "Atılıyor…", de: "Würfeln…" },
  touch_zone:       { tr: "👇 Doğru bölgeye dokun", de: "👇 Tippe auf die richtige Zone" },
  market_sub_3:     { tr: "Para üstü hesabı", de: "Wechselgeld berechnen" },
  market_sub_8:     { tr: "Yüzde ve faiz hesabı", de: "Prozentrechnung & Zinsen" },
  trajectory_label: { tr: "f(x) = a·x² + b·x + c", de: "f(x) = a·x² + b·x + c" },
  goal_target:      { tr: "🎯 Hedef: x ∈ [{x0}, {x1}]", de: "🎯 Ziel: x ∈ [{x0}, {x1}]" },
  board_legend:     { tr: "💎 +15 · ✨ +8 · ⚡ −5 · ? = soru", de: "💎 +15 · ✨ +8 · ⚡ −5 · ? = Frage" },
  form_error:       { tr: "Soru metni ve sayısal cevap gereklidir", de: "Aufgabentext und Antwort sind Pflichtfelder" },
  invalid_input:    { tr: "Lütfen geçerli bir sayı girin", de: "Bitte eine gültige Zahl eingeben" },
  // ── Admin analytics ─────────────────────────────────────────────────────────
  student_analytics:{ tr: "Öğrenci Analitik", de: "Schüler-Analytik" },
  top_students:     { tr: "En İyi Öğrenciler", de: "Top-Schüler" },
  rank:             { tr: "Sıra",             de: "Rang" },
  player:           { tr: "Oyuncu",           de: "Spieler" },
};

export function t(key: keyof typeof dict, lang: Lang, vars?: Record<string, string | number>) {
  let s = dict[key]?.[lang] ?? String(key);
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
}

export const GAMES = [
  { id: "archery",  nameKey: "g_archery_name",  descKey: "g_archery_desc",  emoji: "🏹", gradient: "from-emerald-400 via-teal-400 to-sky-500", scene: "🌳🎯🍃" },
  { id: "mathpoly", nameKey: "g_mathpoly_name", descKey: "g_mathpoly_desc", emoji: "🎲", gradient: "from-fuchsia-500 via-purple-500 to-indigo-500", scene: "💎✨🏰" },
  { id: "goalie",   nameKey: "g_goalie_name",   descKey: "g_goalie_desc",   emoji: "⚽", gradient: "from-sky-400 via-blue-500 to-emerald-500", scene: "🥅⚽🌤️" },
  { id: "pyramid",  nameKey: "g_pyramid_name",  descKey: "g_pyramid_desc",  emoji: "🔺", gradient: "from-amber-400 via-orange-500 to-rose-500", scene: "🐪☀️🏜️" },
  { id: "racer",    nameKey: "g_racer_name",    descKey: "g_racer_desc",    emoji: "🏎️", gradient: "from-rose-500 via-red-500 to-orange-500", scene: "🏁🏎️💨" },
  { id: "market",   nameKey: "g_market_name",   descKey: "g_market_desc",   emoji: "🛒", gradient: "from-lime-400 via-green-500 to-teal-500", scene: "🍎🥕🧀" },
] as const;

export type GameId = (typeof GAMES)[number]["id"];

export const CHEERS_OK  = ["cheer_great", "cheer_nice", "cheer_smart", "cheer_keep"] as const;
export const CHEERS_BAD = ["cheer_oops", "cheer_almost", "cheer_try"] as const;
export function pickCheer(ok: boolean) {
  const a = ok ? CHEERS_OK : CHEERS_BAD;
  return a[Math.floor(Math.random() * a.length)] as keyof typeof dict;
}
