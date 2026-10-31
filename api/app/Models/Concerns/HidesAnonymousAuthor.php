<?php

declare(strict_types=1);

namespace App\Models\Concerns;

/**
 * Builds y guías anónimas no dicen de quién son: sin user_id y con el autor en null. Para saber
 * si quien mira es el dueño, los controladores devuelven is_owner.
 */
trait HidesAnonymousAuthor
{
    public function toArray(): array
    {
        $data = parent::toArray();

        if ($this->is_anonymous) {
            unset($data['user_id']);
            if (array_key_exists('user', $data)) {
                $data['user'] = null;
            }
        }

        return $data;
    }
}
