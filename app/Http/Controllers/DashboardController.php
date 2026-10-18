<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard for the authenticated user's role.
     */
    public function index(Request $request): Response
    {
        $component = match ($request->user()->role) {
            'admin' => 'Admin/Dashboard',
            'guru_piket' => 'Piket/Dashboard',
            'kepsek' => 'Kepsek/Dashboard',
            default => 'Guru/Dashboard',
        };

        return Inertia::render($component);
    }
}
