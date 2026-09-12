DEAD O'CLOCK — SPRITE PACK V1

Contenuto
---------
- 15 nemici.
- 5 frame di movimento per nemico.
- 1 attacco frontale per nemico.
- 2 frame di morte per nemico.
- 12 famiglie di proiettili/magie, 3 frame ciascuna.
- 12 espressioni del protagonista.
- HUD Halloween completo con trasparenza.

Specifiche
----------
- Formato: PNG RGBA con vera trasparenza.
- Nemici: canvas uniforme 384×384 px, allineamento in basso al centro.
- Proiettili: canvas uniforme 192×192 px.
- Volti HUD: canvas uniforme 384×384 px.
- HUD: dimensione originale, area di gioco resa trasparente.
- Ridimensionamenti degli sprite effettuati con nearest-neighbor.

Struttura
---------
enemies/<nome>/movement/frame_01..05.png
enemies/<nome>/attack/front_attack.png
enemies/<nome>/death/death_01..02.png
projectiles/<nome>/frame_01..03.png
player/face/<stato>.png
ui/hud_halloween_transparent.png
source_sheets/original/ — tavole originali
source_sheets/transparent/ — tavole intere senza chroma key

Nota
----
Il verde presente all'interno di magie, fantasmi o dettagli dei mostri è parte
dell'illustrazione ed è stato preservato quando distinto dallo sfondo chroma.
