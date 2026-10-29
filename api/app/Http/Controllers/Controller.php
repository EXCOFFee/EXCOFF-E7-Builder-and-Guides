<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Usuario del token en rutas públicas (sin middleware auth:sanctum). $request->user() usa el
     * guard por defecto ("web", de sesión) e ignora el Bearer token, así que se pide "sanctum".
     */
    protected function optionalUser(Request $request): ?User
    {
        return $request->user() ?? $request->user('sanctum');
    }
}
