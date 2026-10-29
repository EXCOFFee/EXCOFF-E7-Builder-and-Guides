<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Claves de caché de todo lo que se calcula a partir de las builds (lista de builds y
 * stats por héroe). Llevan un número de versión que sube cada vez que se guarda o borra
 * una build: las claves viejas dejan de usarse y vencen solas. El store de producción es
 * "database" y no tiene tags, por eso la versión en lugar de Cache::tags().
 */
final class BuildCache
{
    private const VERSION_KEY = 'builds:cache-version';

    public static function key(string $suffix): string
    {
        return 'builds:v' . self::version() . ':' . $suffix;
    }

    /**
     * increment es atómico (dos guardados a la vez no quedan con el mismo número). En el store
     * "database" no crea la clave si no existe: devuelve false y se crea acá.
     */
    public static function bump(): void
    {
        if (Cache::increment(self::VERSION_KEY) === false) {
            Cache::forever(self::VERSION_KEY, self::version() + 1);
        }
    }

    private static function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 0);
    }
}
