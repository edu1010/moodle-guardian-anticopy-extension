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

## Instalacion (Firefox)

> La rama `master` esta adaptada para Firefox como WebExtension Manifest V2.

1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal**.
3. Selecciona el archivo `manifest.json` de la carpeta raiz del proyecto.
4. Si haces cambios en el codigo, recarga el complemento temporal desde esa misma pantalla.

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
