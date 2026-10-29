<?php

use App\Http\Controllers\Admin\BeritaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JamPelajaranController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MapelController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TahunAjaranController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingPageController::class, 'index'])->name('welcome');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/tahun-ajaran', [TahunAjaranController::class, 'index'])->name('tahun-ajaran.index');
    Route::post('/tahun-ajaran', [TahunAjaranController::class, 'store'])->name('tahun-ajaran.store');
    Route::patch('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'update'])->name('tahun-ajaran.update');
    Route::patch('/tahun-ajaran/{tahunAjaran}/aktif', [TahunAjaranController::class, 'activate'])->name('tahun-ajaran.activate');
    Route::delete('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'destroy'])->name('tahun-ajaran.destroy');

    Route::get('/kelas', [KelasController::class, 'index'])->name('kelas.index');
    Route::post('/kelas', [KelasController::class, 'store'])->name('kelas.store');
    Route::patch('/kelas/{kelas}', [KelasController::class, 'update'])->name('kelas.update');
    Route::delete('/kelas/{kelas}', [KelasController::class, 'destroy'])->name('kelas.destroy');

    Route::get('/mapel', [MapelController::class, 'index'])->name('mapel.index');
    Route::post('/mapel', [MapelController::class, 'store'])->name('mapel.store');
    Route::patch('/mapel/{mapel}', [MapelController::class, 'update'])->name('mapel.update');
    Route::delete('/mapel/{mapel}', [MapelController::class, 'destroy'])->name('mapel.destroy');

    Route::post('/jam-pelajaran', [JamPelajaranController::class, 'store'])->name('jam-pelajaran.store');
    Route::patch('/jam-pelajaran/{jamPelajaran}', [JamPelajaranController::class, 'update'])->name('jam-pelajaran.update');
    Route::delete('/jam-pelajaran/{jamPelajaran}', [JamPelajaranController::class, 'destroy'])->name('jam-pelajaran.destroy');

    // Route aliases for English naming
    Route::get('/subjects', [MapelController::class, 'index'])->name('subjects.index');
    Route::post('/subjects', [MapelController::class, 'store'])->name('subjects.store');
    Route::patch('/subjects/{mapel}', [MapelController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{mapel}', [MapelController::class, 'destroy'])->name('subjects.destroy');

    Route::post('/time-slots', [JamPelajaranController::class, 'store'])->name('time-slots.store');
    Route::patch('/time-slots/{jamPelajaran}', [JamPelajaranController::class, 'update'])->name('time-slots.update');
    Route::delete('/time-slots/{jamPelajaran}', [JamPelajaranController::class, 'destroy'])->name('time-slots.destroy');

    Route::get('/admin/berita', [BeritaController::class, 'index'])->name('admin.berita.index');
    Route::post('/admin/berita', [BeritaController::class, 'store'])->name('admin.berita.store');
    Route::post('/admin/berita/{berita}', [BeritaController::class, 'update'])->name('admin.berita.update');
    Route::patch('/admin/berita/{berita}', [BeritaController::class, 'update']);
    Route::patch('/admin/berita/{berita}/toggle-pin', [BeritaController::class, 'togglePin'])->name('admin.berita.toggle-pin');
    Route::delete('/admin/berita/{berita}', [BeritaController::class, 'destroy'])->name('admin.berita.destroy');
});

require __DIR__.'/auth.php';
