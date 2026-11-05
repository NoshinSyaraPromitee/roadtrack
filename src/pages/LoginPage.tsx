import { RolePicker } from '@/features/session';
import { Logo } from '@/shared/ui';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="hazard h-2" />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <Logo />
        <h1 className="mt-10 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Every worker counted.
          <br />
          <span className="text-amber-400">Every taka accounted for.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-zinc-400 md:text-lg">
          RoadTrack digitises the daily road construction shift: crew clock-in, material issue, rest and snack reminders, end-of-shift recount and fair payroll
          with extra credit for senior and sick workers.
        </p>
        <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-widest text-zinc-500">Choose a role to explore the demo</p>
        <RolePicker />
        <p className="mt-8 text-xs text-zinc-500">Demo data is stored in your browser. Use the reset button in the header to start fresh.</p>
      </div>
    </div>
  );
}