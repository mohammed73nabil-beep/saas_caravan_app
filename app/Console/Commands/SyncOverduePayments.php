<?php

namespace App\Console\Commands;

use App\Services\ClaimService;
use Illuminate\Console\Command;

class SyncOverduePayments extends Command
{
    protected $signature = 'claims:sync-overdue';
    protected $description = 'Automatically mark overdue contract payments and create claim records';

    public function __construct(protected ClaimService $claimService)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Syncing overdue payments...');
        $this->claimService->syncOverduePayments();
        $this->info('Done.');
    }
}
