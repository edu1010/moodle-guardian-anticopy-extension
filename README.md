# Moodle Guardian (Descargas + Anticopia) (WebExtension)

Extension para Firefox/Chrome que hace dos cosas:

1. Automatiza en Moodle el clic de "Descargar todas las entregas".
2. Abre un analizador local de similitud para detectar posibles copias.

## Soporte de entregas en ZIP/RAR/7z

- Puedes cargar directamente el ZIP principal descargado desde Moodle.
- Si dentro hay ZIPs de alumnos, se descomprimen automaticamente (sin limite por numero de entregas, con salvaguardas por archivo/profundidad).
- Se intentan procesar `.zip`, `.rar` y `.7z` (incluidos comprimidos anidados); si alguno no puede leerse se marca como "no analizado" y se lista en el resumen.
- Ademas de texto y codigo, se extrae texto de `.pdf`, `.docx`, `.odt`, `.xlsx`, `.xlsm`, `.ods`, `.csv` y `.tsv` cuando el archivo contiene texto real.

## Estructura

- `manifest.json`: configuracion de la extension.
- `contentScript.js`: automatizacion en paginas `mod/assign`.
- `background.js`: mensajeria y apertura del analizador.
- `popup/`: interfaz rapida.
- `analyzer/`: analisis de similitud local.

## Instalacion

### Castellano

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

### Catala

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

### English

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

## Uso

1. En Moodle, abre la tarea y la vista de calificacion.
2. En la extension, pulsa **Descargar todas las entregas**.
3. Pulsa **Abrir analizador de similitud**.
4. En el analizador:
   - opcion A: selecciona el ZIP principal de Moodle,
   - opcion B: selecciona la carpeta descomprimida.
5. (Opcional) anade archivos de parte comun en todas las entregas (texto/codigo, PDF con texto, DOCX/ODT, XLSX/ODS/CSV/TSV o comprimidos `.zip/.rar/.7z` con ellos).
6. Ajusta umbral y porcentaje de lineas comunes.
7. Ejecuta el analisis.

## Interpretacion de resultados

- Score entre `0.000` y `1.000`.
- Cuanto mas alto, mayor parecido textual/estructural.
- Una similitud alta no prueba copia por si sola; sirve para priorizar revision manual.

## Limitaciones actuales

- Los PDF escaneados como imagen no se leen porque no hay OCR; solo se extrae texto embebido en el PDF.
- Los `.xls` antiguos binarios y `.xlsb` no se procesan sin una libreria adicional; usa `.xlsx` cuando sea posible.
- ZIP cifrados o ZIP64 pueden no poder leerse.
