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
};

export function t(key: keyof typeof dict, lang: Lang, vars?: Record<string, string | number>) {
  let s = dict[key]?.[lang] ?? String(key);
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
}

export const GAMES = [
  { id: "archery", nameKey: "g_archery_name", descKey: "g_archery_desc", emoji: "🏹" },
  { id: "mathpoly", nameKey: "g_mathpoly_name", descKey: "g_mathpoly_desc", emoji: "🎲" },
  { id: "goalie", nameKey: "g_goalie_name", descKey: "g_goalie_desc", emoji: "🥅" },
  { id: "pyramid", nameKey: "g_pyramid_name", descKey: "g_pyramid_desc", emoji: "🔺" },
  { id: "racer", nameKey: "g_racer_name", descKey: "g_racer_desc", emoji: "🏎️" },
  { id: "market", nameKey: "g_market_name", descKey: "g_market_desc", emoji: "🛒" },
] as const;

export type GameId = (typeof GAMES)[number]["id"];
