import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk - SADA SMPN 2 Soreang" />

            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Masuk ke Portal SADA
                </h1>
                <p className="mt-1 text-xs text-white/70">
                    Gunakan NIP/NUPTK/Username dan kata sandi akun Anda untuk mengakses workspace sesuai role.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
                        NIP / NUPTK / Username
                    </label>

                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        placeholder="Masukkan NIP / NUPTK"
                        className="mt-1 block w-full rounded-xl border-white/20 bg-white/10 text-sm text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/15 focus:ring-emerald-400"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                    />

                    <InputError message={errors.username} className="mt-1.5 text-rose-300" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-xs font-semibold text-white/90 uppercase tracking-wider">
                            Kata Sandi
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:underline"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="Masukkan kata sandi"
                        className="mt-1 block w-full rounded-xl border-white/20 bg-white/10 text-sm text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/15 focus:ring-emerald-400"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5 text-rose-300" />
                </div>

                <div className="pt-0.5">
                    <label className="inline-flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded border-white/30 bg-white/10 text-emerald-600 focus:ring-emerald-400"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-white/80">
                            Ingat perangkat ini
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/20 disabled:opacity-60 transition"
                    >
                        Masuk ke Sistem
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
