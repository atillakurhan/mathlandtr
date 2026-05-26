export type Lang = "tr" | "de";
export type ClassLevel = 3 | 8;

type Dict = Record<string, { tr: string; de: string }>;

export const dict: Dict = {
  app_title: { tr: "Matematik Arena", de: "Mathe Arena" },
  app_tag: {
    tr: "Öğretmenin yönettiği eğlenceli matematik oyunları",
    de: "Mathe-Spiele, vom Lehrer gesteuert",
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
  class_8: { tr: "8. Sınıf (Realschule)", de: "Klasse 8 (Realschule)" },
  difficulty: { tr: "Zorluk", de: "Schwierigkeit" },
  easy: { tr: "Kolay", de: "Leicht" },
  medium: { tr: "Orta", de: "Mittel" },
  hard: { tr: "Zor", de: "Schwer" },
  locked: { tr: "Kilitli", de: "Gesperrt" },
  unlock_hint: { tr: "{n} puan kazan kilidi aç", de: "Hol {n} Punkte zum Freischalten" },
  questions: { tr: "Sorular", de: "Fragen" },
  add_question: { tr: "Soru Ekle", de: "Frage hinzufügen" },
  prompt: { tr: "Soru metni", de: "Aufgabentext" },
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
  play_again: { tr: "Tekrar Oyna", de: "Nochmal", },
  back_home: { tr: "Ana Sayfa", de: "Startseite" },
  correct: { tr: "Doğru!", de: "Richtig!" },
  wrong: { tr: "Yanlış", de: "Falsch" },
  no_questions: {
    tr: "Bu oyun için soru bulunamadı. Öğretmen panelinden ekleyin.",
    de: "Keine Fragen vorhanden. Bitte im Lehrerbereich hinzufügen.",
  },
  language: { tr: "Dil", de: "Sprache" },
  // Games
  g_archery_name: { tr: "Okçu Matematik", de: "Bogen-Mathe" },
  g_archery_desc: {
    tr: "Hareketli hedefleri sorunun doğru cevabıyla vur.",
    de: "Triff das bewegliche Ziel mit der richtigen Antwort.",
  },
  g_mathpoly_name: { tr: "Matematik Monopoly", de: "Mathe-Monopoly" },
  g_mathpoly_desc: {
    tr: "Zar at, kareleri kazan, soruları çöz.",
    de: "Würfeln, Felder erobern, Aufgaben lösen.",
  },
  g_goalie_name: { tr: "Parabol Kalecisi", de: "Parabel-Torwart" },
  g_goalie_desc: {
    tr: "Topun yörüngesini ayarla, gole engel ol.",
    de: "Flugbahn einstellen und halten.",
  },
  g_pyramid_name: { tr: "Sayı Piramidi", de: "Zahlenpyramide" },
  g_pyramid_desc: {
    tr: "Alt sayıları topla, tepeye ulaş.",
    de: "Addiere die Zahlen bis zur Spitze.",
  },
  g_racer_name: { tr: "Hız Koridoru", de: "Mathe-Rennstrecke" },
  g_racer_desc: {
    tr: "Engelleri doğru cevapla aş.",
    de: "Antworten, Hindernisse überholen.",
  },
  g_market_name: { tr: "Pazar Yeri", de: "Marktplatz" },
  g_market_desc: {
    tr: "Para üstü ve yüzde hesaplamaları.",
    de: "Wechselgeld und Prozentrechnung.",
  },
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
