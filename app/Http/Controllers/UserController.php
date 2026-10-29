<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the manageable users.
     */
    public function index(Request $request): Response
    {
        $query = User::query()->where('role', '!=', 'admin');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            if (in_array($role, ['guru', 'guru_piket', 'kepsek'], true)) {
                $query->where('role', $role);
            }
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'aktif') {
                $query->where('aktif', true);
            } elseif ($status === 'nonaktif') {
                $query->where('aktif', false);
            }
        }

        return Inertia::render('Users/Index', [
            'users' => $query->orderBy('nama')->get(['id', 'username', 'nama', 'email', 'no_wa', 'role', 'jenis_pegawai', 'aktif']),
            'filters' => $request->only(['search', 'role', 'status']),
            'counts' => [
                'total' => User::where('role', '!=', 'admin')->count(),
                'guru' => User::where('role', 'guru')->count(),
                'guru_piket' => User::where('role', 'guru_piket')->count(),
                'kepsek' => User::where('role', 'kepsek')->count(),
                'nonaktif' => User::where('role', '!=', 'admin')->where('aktif', false)->count(),
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['wajib_ganti_password'] = true;
        $data['aktif'] = $data['aktif'] ?? true;
        $data['jenis_pegawai'] = $data['role'] === 'guru' ? $data['jenis_pegawai'] : null;
        $data['no_wa'] = $data['role'] === 'guru_piket' ? $data['no_wa'] : null;

        User::create($data);

        return redirect()->route('users.index');
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->ensureManageable($user);

        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $data['wajib_ganti_password'] = true;
        } else {
            unset($data['password']);
        }

        $data['jenis_pegawai'] = $data['role'] === 'guru' ? $data['jenis_pegawai'] : null;
        $data['no_wa'] = $data['role'] === 'guru_piket' ? $data['no_wa'] : null;

        $user->update($data);

        return redirect()->route('users.index');
    }

    /**
     * Toggle active status of the specified user.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        $this->ensureManageable($user);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'Tidak dapat mengubah status akun sendiri.',
            ]);
        }

        $user->update(['aktif' => ! $user->aktif]);

        return redirect()->route('users.index');
    }

    /**
     * Deactivate the specified user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureManageable($user);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'Tidak dapat menonaktifkan akun sendiri.',
            ]);
        }

        $user->update(['aktif' => false]);

        return redirect()->route('users.index');
    }

    /**
     * Ensure the given user is not an admin account.
     */
    protected function ensureManageable(User $user): void
    {
        if ($user->role === 'admin') {
            abort(403);
        }
    }
}
