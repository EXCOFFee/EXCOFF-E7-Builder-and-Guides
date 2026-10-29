<?php

/**
 * Corre en el servidor. Compara el manifiesto del repo con los archivos instalados.
 *
 * Uso: php remote-scan.php <root> <prefijos-a-ignorar-separados-por-coma> < manifest.tsv
 * Manifiesto: una línea por archivo, "<blob sha1>\t<t|b>\t<ruta relativa>".
 * Salida: "N\t<ruta>" (falta en el servidor), "M\t<ruta>" (distinto), "X\t<ruta>" (solo en el servidor).
 *
 * Los archivos subidos desde Windows tienen CRLF y el repo guarda LF: para los de texto se
 * acepta coincidencia con o sin CRLF, así un cambio de saltos de línea no cuenta como cambio.
 */

[, $root, $ignore] = $argv + [null, null, ''];
if (!$root || !is_dir($root)) {
    fwrite(STDERR, "remote-scan: no existe el directorio $root\n");
    exit(2);
}
$root = rtrim($root, '/');
$ignore = array_values(array_filter(explode(',', $ignore)));

$blobSha = fn (string $data): string => sha1('blob ' . strlen($data) . "\0" . $data);

$tracked = [];
while (($line = fgets(STDIN)) !== false) {
    $line = rtrim($line, "\r\n");
    if ($line === '') {
        continue;
    }
    [$sha, $kind, $path] = explode("\t", $line, 3);
    $tracked[$path] = true;

    $file = "$root/$path";
    if (!is_file($file)) {
        echo "N\t$path\n";
        continue;
    }

    $data = file_get_contents($file);
    $same = $blobSha($data) === $sha
        || ($kind === 't' && $blobSha(str_replace("\r\n", "\n", $data)) === $sha);
    if (!$same) {
        echo "M\t$path\n";
    }
}

$isIgnored = function (string $path) use ($ignore): bool {
    foreach ($ignore as $prefix) {
        if ($path === rtrim($prefix, '/') || str_starts_with($path, $prefix)) {
            return true;
        }
    }
    return false;
};

// Directorios ignorados se podan sin recorrerlos (vendor, storage...); los symlinks no se siguen.
$dirs = new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS);
$filter = new RecursiveCallbackFilterIterator($dirs, function (SplFileInfo $item) use ($root, $isIgnored) {
    $relative = substr($item->getPathname(), strlen($root) + 1);
    return !$isIgnored($item->isDir() && !$item->isLink() ? "$relative/" : $relative);
});

$extra = [];
foreach (new RecursiveIteratorIterator($filter) as $item) {
    $relative = substr($item->getPathname(), strlen($root) + 1);
    if (($item->isFile() || $item->isLink()) && !isset($tracked[$relative])) {
        $extra[] = $relative;
    }
}
sort($extra);
foreach ($extra as $path) {
    echo "X\t$path\n";
}
