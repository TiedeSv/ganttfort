import json,re,sys
d=json.load(open(sys.argv[1]))
GER=re.compile(r"[äöüÄÖÜß„“]|\b(der|die|das|und|nicht|noch|ist|ein|eine|mit|bis|seit|fertig|Frist|Feld|Felder|Insel|Aufgabe|Aufgaben|Gebäude|kein|keine|zur|zum|vom|auf|für|wird|kommt|heute|gestern|morgen|Tage|Tagen|Woche|Meilenstein|Späher|Schlacht|Angreifer|Baustelle|Bauplan|verworfen|geplant|Entscheidung|Stand|Welt|Projekt|Legende|Sektor|Sektoren|Lage|Verlauf|Zuletzt|ansehen|kopieren|Befehl|Datum|neu|alle|alles|von|vor|nach|bei|wenn|oder|sich|sie|er|du|dein|deine|hier|jetzt|gerade|schon|nur|auch|immer|Lager|Kundschafter|Heerlager|Belagerung|Gehalten|Bild|Ruhig|ruhig)\b")
for x in d:
    if GER.search(x['t']): print(repr(x['t'])[:200], '   <', x['s'])
