export interface MaReplikation /*extends Revision*/ {
  tabellenNr: number; // 1 TB_Eintrag, 2 FZ_Notiz, 7 FZ_Fahrradstand, 12 HH_Buchung
  replikationUid: string;
  istGeloescht: boolean;
  geloeschtAm: Date;
  geaendertAm: Date;
}
