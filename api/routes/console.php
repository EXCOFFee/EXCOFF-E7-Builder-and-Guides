<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| This section defines scheduled tasks that run automatically.
| On Hostinger, add this cron job:
| * * * * * cd /path-to-api && php artisan schedule:run >> /dev/null 2>&1
|
*/

// Sync hero and artifact data daily at 3:00 AM (production only, one run at a time,
// output kept in storage/logs/data-sync.log to check what each run changed)
Schedule::command('data:sync')->dailyAt('03:00')
    ->environments(['production'])
    ->withoutOverlapping(60)
    ->appendOutputTo(storage_path('logs/data-sync.log'))
    ->onSuccess(function () {
        info('Data sync completed successfully');
    })
    ->onFailure(function () {
        error_log('Data sync failed');
    });
