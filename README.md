# Moodle Guardian (Downloads + Anti-copy) (WebExtension)

## English

Extension for Firefox/Chrome that does two things:

1. Automates Moodle's "Download all submissions" action.
2. Opens a local similarity analyzer to detect possible copying.

### ZIP/RAR/7z Submission Support

- You can load the main ZIP downloaded from Moodle directly.
- If it contains student ZIP files, they are extracted automatically with no submission-count limit, while keeping safeguards per file and archive depth.
- The analyzer tries to process `.zip`, `.rar` and `.7z`, including nested archives; unreadable archives are marked as "not analyzed" and listed in the summary.
- Besides text and code, it extracts text from `.pdf`, `.docx`, `.odt`, `.xlsx`, `.xlsm`, `.ods`, `.csv` and `.tsv` when the file contains real text.

### Structure

- `manifest.json`: extension configuration.
- `contentScript.js`: automation on `mod/assign` pages.
- `background.js`: messaging and analyzer opening.
- `popup/`: quick interface.
- `analyzer/`: local similarity analysis.

### Installation

#### Firefox

> The `master` branch is adapted for Firefox as a Manifest V2 WebExtension.

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` file from the project root folder.
4. If you change the code, reload the temporary add-on from the same page.

#### Chrome

> To install in Chrome, switch to the `chrome-mv3` branch first. That branch is adapted for Manifest V3.

1. Switch branch: `git switch chrome-mv3`.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project root folder, where `manifest.json` is located.
6. If you change the code, click **Reload** on the extension card.

### Usage

1. In Moodle, open the assignment and grading view.
2. In the extension, click **Download all submissions**.
3. Click **Open similarity analyzer**.
4. In the analyzer:
   - option A: select the main Moodle ZIP,
   - option B: select the extracted folder.
5. Optionally, add common-base files shared by all submissions: text/code, text-based PDF, DOCX/ODT, XLSX/ODS/CSV/TSV or `.zip/.rar/.7z` archives containing them.
6. Adjust the threshold and common-line percentage.
7. Run the analysis.

### Result Interpretation

- Score between `0.000` and `1.000`.
- Higher scores mean more textual or structural similarity.
- High similarity does not prove copying by itself; it helps prioritize manual review.

### Current Limitations

- Scanned image-only PDFs are not read because there is no OCR; only embedded PDF text is extracted.
- Old binary `.xls` files and `.xlsb` are not processed without an additional library; use `.xlsx` when possible.
- Encrypted ZIP or ZIP64 files may not be readable.

## Castellano

Extension para Firefox/Chrome que hace dos cosas:

1. Automatiza en Moodle el clic de "Descargar todas las entregas".
2. Abre un analizador local de similitud para detectar posibles copias.

### Soporte de entregas en ZIP/RAR/7z

- Puedes cargar directamente el ZIP principal descargado desde Moodle.
- Si dentro hay ZIPs de alumnos, se descomprimen automaticamente sin limite por numero de entregas, con salvaguardas por archivo y profundidad.
- Se intentan procesar `.zip`, `.rar` y `.7z`, incluidos comprimidos anidados; si alguno no puede leerse se marca como "no analizado" y se lista en el resumen.
- Ademas de texto y codigo, se extrae texto de `.pdf`, `.docx`, `.odt`, `.xlsx`, `.xlsm`, `.ods`, `.csv` y `.tsv` cuando el archivo contiene texto real.

### Estructura

- `manifest.json`: configuracion de la extension.
- `contentScript.js`: automatizacion en paginas `mod/assign`.
- `background.js`: mensajeria y apertura del analizador.
- `popup/`: interfaz rapida.
- `analyzer/`: analisis de similitud local.

### Instalacion

#### Firefox

> La rama `master` esta adaptada para Firefox como WebExtension Manifest V2.

1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal**.
3. Selecciona el archivo `manifest.json` de la carpeta raiz del proyecto.
4. Si haces cambios en el codigo, recarga el complemento temporal desde esa misma pantalla.

#### Chrome

> Para instalar en Chrome, cambia antes a la rama `chrome-mv3`, que esta adaptada a Manifest V3.

1. Cambia de rama: `git switch chrome-mv3`.
2. Abre `chrome://extensions/`.
3. Activa **Developer mode**.
4. Pulsa **Load unpacked**.
5. Selecciona la carpeta raiz del proyecto, donde esta `manifest.json`.
6. Si haces cambios en el codigo, pulsa **Reload** en la tarjeta de la extension.

### Uso

1. En Moodle, abre la tarea y la vista de calificacion.
2. En la extension, pulsa **Descargar todas las entregas**.
3. Pulsa **Abrir analizador de similitud**.
4. En el analizador:
   - opcion A: selecciona el ZIP principal de Moodle,
   - opcion B: selecciona la carpeta descomprimida.
5. Opcionalmente, anade archivos de parte comun en todas las entregas: texto/codigo, PDF con texto, DOCX/ODT, XLSX/ODS/CSV/TSV o comprimidos `.zip/.rar/.7z` con ellos.
6. Ajusta umbral y porcentaje de lineas comunes.
7. Ejecuta el analisis.

### Interpretacion de resultados

- Score entre `0.000` y `1.000`.
- Cuanto mas alto, mayor parecido textual o estructural.
- Una similitud alta no prueba copia por si sola; sirve para priorizar revision manual.

### Limitaciones actuales

- Los PDF escaneados como imagen no se leen porque no hay OCR; solo se extrae texto embebido en el PDF.
- Los `.xls` antiguos binarios y `.xlsb` no se procesan sin una libreria adicional; usa `.xlsx` cuando sea posible.
- ZIP cifrados o ZIP64 pueden no poder leerse.

## Catala

Extensio per a Firefox/Chrome que fa dues coses:

1. Automatitza a Moodle el clic de "Descarrega totes les trameses".
2. Obre un analitzador local de similitud per detectar possibles copies.

### Suport de trameses en ZIP/RAR/7z

- Pots carregar directament el ZIP principal descarregat des de Moodle.
- Si a dins hi ha ZIPs d'alumnes, es descomprimeixen automaticament sense limit pel nombre de trameses, amb salvaguardes per fitxer i profunditat.
- S'intenten processar `.zip`, `.rar` i `.7z`, inclosos comprimits anidats; si algun no es pot llegir es marca com a "no analitzat" i es mostra al resum.
- A mes de text i codi, s'extreu text de `.pdf`, `.docx`, `.odt`, `.xlsx`, `.xlsm`, `.ods`, `.csv` i `.tsv` quan el fitxer conte text real.

### Estructura

- `manifest.json`: configuracio de l'extensio.
- `contentScript.js`: automatitzacio en pagines `mod/assign`.
- `background.js`: missatgeria i obertura de l'analitzador.
- `popup/`: interficie rapida.
- `analyzer/`: analisi de similitud local.

### Instal-lacio

#### Firefox

> La branca `master` esta adaptada per a Firefox com a WebExtension Manifest V2.

1. Obre `about:debugging#/runtime/this-firefox`.
2. Prem **Carrega un complement temporal**.
3. Selecciona el fitxer `manifest.json` de la carpeta arrel del projecte.
4. Si fas canvis al codi, recarrega el complement temporal des de la mateixa pantalla.

#### Chrome

> Per instal-lar a Chrome, canvia abans a la branca `chrome-mv3`, que esta adaptada a Manifest V3.

1. Canvia de branca: `git switch chrome-mv3`.
2. Obre `chrome://extensions/`.
3. Activa **Developer mode**.
4. Prem **Load unpacked**.
5. Selecciona la carpeta arrel del projecte, on hi ha `manifest.json`.
6. Si fas canvis al codi, prem **Reload** a la targeta de l'extensio.

### Us

1. A Moodle, obre la tasca i la vista de qualificacio.
2. A l'extensio, prem **Descarrega totes les trameses**.
3. Prem **Obre l'analitzador de similitud**.
4. A l'analitzador:
   - opcio A: selecciona el ZIP principal de Moodle,
   - opcio B: selecciona la carpeta descomprimida.
5. Opcionalment, afegeix fitxers de part comuna en totes les trameses: text/codi, PDF amb text, DOCX/ODT, XLSX/ODS/CSV/TSV o comprimits `.zip/.rar/.7z` amb aquests fitxers.
6. Ajusta el llindar i el percentatge de linies comunes.
7. Executa l'analisi.

### Interpretacio de resultats

- Score entre `0.000` i `1.000`.
- Com mes alt, mes semblanca textual o estructural.
- Una similitud alta no prova copia per si sola; serveix per prioritzar una revisio manual.

### Limitacions actuals

- Els PDF escanejats com a imatge no es llegeixen perque no hi ha OCR; nomes s'extreu text incrustat al PDF.
- Els `.xls` antics binaris i `.xlsb` no es processen sense una llibreria addicional; usa `.xlsx` quan sigui possible.
- ZIP xifrats o ZIP64 poden no poder llegir-se.
