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
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->where('role', '!=', 'admin')
                ->orderBy('nama')
                ->get(['id', 'username', 'nama', 'email', 'role', 'jenis_pegawai', 'aktif']),
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

        $user->update($data);

        return redirect()->route('users.index');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureManageable($user);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'Tidak dapat menghapus akun sendiri.',
            ]);
        }

        $user->delete();

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
