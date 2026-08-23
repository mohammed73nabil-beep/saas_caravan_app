<?php

use App\Console\Commands\SyncOverduePayments;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run daily at midnight to mark overdue payments and auto-generate claims
Schedule::command(SyncOverduePayments::class)->dailyAt('00:05');
