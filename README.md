# Moodle Guardian (Descargas + Anticopia) (WebExtension)

Extension para Firefox/Chrome que hace dos cosas:

1. Automatiza en Moodle el clic de "Descargar todas las entregas".
2. Abre un analizador local de similitud para detectar posibles copias.

## Soporte de entregas en ZIP/RAR/7z

- Puedes cargar directamente el ZIP principal descargado desde Moodle.
- Si dentro hay ZIPs de alumnos, se descomprimen automaticamente (sin limite por numero de entregas, con salvaguardas por archivo/profundidad).
- Si dentro hay `.rar` o `.7z`, se marcan como "no analizados" y se listan en el resumen.

## Estructura

- `manifest.json`: configuracion de la extension.
- `contentScript.js`: automatizacion en paginas `mod/assign`.
- `background.js`: mensajeria y apertura del analizador.
- `popup/`: interfaz rapida.
- `analyzer/`: analisis de similitud local.

## Instalacion (Firefox)

1. Abre `about:debugging`.
2. Entra en **This Firefox**.
3. Pulsa **Load Temporary Add-on...**.
4. Selecciona `manifest.json`.

## Uso

1. En Moodle, abre la tarea y la vista de calificacion.
2. En la extension, pulsa **Descargar todas las entregas**.
3. Pulsa **Abrir analizador de similitud**.
4. En el analizador:
   - opcion A: selecciona el ZIP principal de Moodle,
   - opcion B: selecciona la carpeta descomprimida.
5. (Opcional) anade archivos de parte comun en todas las entregas (varios `.txt/.md/.html` o un `.zip` con ellos).
6. Ajusta umbral y porcentaje de lineas comunes.
7. Ejecuta el analisis.

## Interpretacion de resultados

- Score entre `0.000` y `1.000`.
- Cuanto mas alto, mayor parecido textual/estructural.
- Una similitud alta no prueba copia por si sola; sirve para priorizar revision manual.

## Limitaciones actuales

- Analiza principalmente texto y codigo.
- PDF/DOCX no se procesan en esta version.
- ZIP cifrados o ZIP64 pueden no poder leerse.
