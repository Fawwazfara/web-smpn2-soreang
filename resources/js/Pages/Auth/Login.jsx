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
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                    Masuk ke Portal SADA
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                    Gunakan NIP/NUPTK dan kata sandi akun Anda untuk mengakses workspace sesuai role.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl border border-[#CBE9DA] bg-[#EDF6F1] px-3.5 py-2.5 text-xs font-semibold text-[#0E7452]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="username" value="NIP / NUPTK" />

                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        placeholder="Masukkan NIP / NUPTK"
                        className="mt-1.5 block w-full rounded-xl border-[#DCE5E1] bg-[#F8FAF9] text-sm focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                    />

                    <InputError message={errors.username} className="mt-1.5" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-[#0E7452] hover:text-[#0F382A] hover:underline"
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
                        className="mt-1.5 block w-full rounded-xl border-[#DCE5E1] bg-[#F8FAF9] text-sm focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="pt-0.5">
                    <label className="inline-flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="text-[#0F382A] focus:ring-[#0E7452]"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600">
                            Ingat perangkat ini
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-[#0F382A] py-3 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#164B38] disabled:opacity-60 transition"
                    >
                        Masuk ke Sistem
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
