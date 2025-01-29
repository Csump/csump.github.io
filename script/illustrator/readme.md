# Tudnivalók

Jelen utasítások követésével betörheted az Illustratort, és automatizációra idomíthatod, hogy egy előre megszerkesztett masterkártya mintájára egy mezei Excel táblázat segítségével legenerálja mind az összes hiányzó kártyát.

## Lépések

1. Töltsd le a drive-ról a `receptstat.xlsx` táblázatot.
2. Ments egy másolatot ebbe a mappába UTF-8-as kódolású CSV-ként, `receptstat.csv` néven.
3. Futtasd le a `csv-to-json.py` scriptet. (`py .\csv-to-json.py`)
4. Futtasd le Illustratorban a `recipe-card.jsx` scriptet. (Ctrl-F12-vel tudod benyitni a scripttallózást.)

## Potenciális problémák

* Az Ecxel néha szar, és nem rakja idézőjelek közé a vesszővel rendelkező cellákat, amit aztán a CSS választóként értelmez, és minden szar lesz. Megoldás: Excelben *Home* -> *Cells* -> *Format* -> *Custom* -> A type-hoz eztet másold be: `\"@\"`, majd mentsd el, és mehet a 3. ponttól minden.
* Ha ";" helyett ","-t használ ez a szar, akkor a CSV-t nyisd meg Excelben -> Fájl -> Beállítások -> Speciális -> a szerkesztési szekciónál (legfelül) a tizedes/ezreselválasztót állítsd sorban ","-re és "."-ra.