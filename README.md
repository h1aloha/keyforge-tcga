# KeyForge para TCG Arena

Archivos: `gamefile.json`, `cards.json`, `translations.json` e `img/` (dorso y fichas provisionales).

## Publicar
1. Crea en GitHub un repositorio **público** llamado `keyforge-tcga`.
2. Sube todo el contenido de esta carpeta (arrastrando los archivos en "Add file → Upload files").
3. En *Settings → Pages* elige "Deploy from a branch", rama `main`, carpeta `/ (root)`.
4. Espera 1-2 minutos y comprueba que abre `https://h1aloha.github.io/keyforge-tcga/gamefile.json`.
5. En https://tcg-arena.fr/build pega esa URL y copia el enlace generado.

## Regenerar las cartas
```
git clone --depth 1 https://github.com/keyteki/keyteki-json-data.git
node scripts/build-cards.mjs ./keyteki-json-data .
```
Las imágenes de cartas se enlazan desde el CDN original de los datos de Keyteki (solo en inglés).
