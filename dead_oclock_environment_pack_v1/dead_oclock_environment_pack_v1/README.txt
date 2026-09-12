DEAD O'CLOCK — ENVIRONMENT ART PACK v1
=========================================

Percorso visivo:
  1. Bosco tetro (breve apertura, lupi mannari)
  2. Cimitero
  3. Cripta
  4. Catacombe

CONTENUTO
---------
- 64 texture native + 64 versioni 128x128 (16 per area)
- 80 elementi di scenario trasparenti (20 per area)
- 20 pickup, armi, munizioni e chiavi trasparenti
- 20 frame per porte e transizioni (4 animazioni x 5 frame)
- 20 frame per impatti ed effetti di combattimento (4 x 5)
- 20 frame ambientali (nebbia, fiamme, gocce: 4 x 5)
- 4 panorami, uno per area
- atlanti pronti e tavole sorgente originali

STRUTTURA
---------
textures/<area>/native       texture alla risoluzione generata
textures/<area>/128x128      texture ridimensionate per uso retro
props/<area>                 oggetti di scenario con alpha reale
pickups                      pickup e chiavi con alpha reale
animations                   sequenze numerate su canvas 320x320
panoramas                    fondali orizzontali
atlases                      tavole compatte senza separatori
source_sheets/original       tavole generate non modificate
source_sheets/transparent    tavole con checker rimosso

NOTE D'USO
----------
- PNG in sRGB. Props, pickup e animazioni sono RGBA con trasparenza reale.
- I frame di ogni animazione condividono un canvas 320x320 e un pivot inferiore.
- Le texture 128x128 usano nearest-neighbour per mantenere il carattere pixel art.
- Le texture sono concept tile: prima dell'integrazione definitiva, verificare le
  giunzioni nel motore e applicare un eventuale passaggio di seamless wrapping.
- manifest.json contiene i nomi e i percorsi di tutti gli asset.

Direzione artistica: flat-color / pixel art Amiga 1200 AGA, horror gotico di Halloween.
