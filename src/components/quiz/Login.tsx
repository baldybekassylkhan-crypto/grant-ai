"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { MinimalShell } from "@/components/shell/MinimalShell";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/client";
import { mergeAfterLogin, setUser } from "@/lib/account";
import { SUPPORT_EMAIL } from "@/lib/site";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

const ERRORS: Record<string, [string, string]> = {
  invalid_email: ["Пошта адресі қате.", "Неверный адрес почты."],
  weak_password: ["Құпиясөз кемінде 8 таңбадан тұруы керек.", "Пароль должен быть не короче 8 символов."],
  email_taken: ["Бұл поштамен аккаунт бар. Кіріп көріңіз.", "Аккаунт с этой почтой уже есть. Попробуйте войти."],
  invalid_credentials: ["Пошта немесе құпиясөз қате.", "Неверная почта или пароль."],
  rate_limited: ["Тым көп әрекет. 10 минуттан кейін қайталаңыз.", "Слишком много попыток. Повторите через 10 минут."],
};

export function LoginForm() {
  const l = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState("/account");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("mode") === "register") setMode("register");
    const n = p.get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) setNext(n);
    try {
      const q = JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null");
      if (q?.role === "parent") setRole("parent");
    } catch {}
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name, role }),
      });
      const j = await res.json().catch(() => ({}));
      if (!j.ok) {
        const m = ERRORS[j.reason as string];
        setError(m ? T(l, m[0], m[1]) : T(l, "Қате шықты. Қайталап көріңіз.", "Произошла ошибка. Попробуйте ещё раз."));
        setBusy(false);
        return;
      }
      setUser(j.user);
      await mergeAfterLogin(j.data);
      router.push(lp(l, next));
    } catch {
      setError(T(l, "Желі қатесі.", "Ошибка сети."));
      setBusy(false);
    }
  };

  return (
    <MinimalShell>
      <div className="mx-auto max-w-[440px] px-4 pt-12">
        <SegmentedControl
          label={T(l, "Кіру немесе тіркелу", "Вход или регистрация")}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError("");
          }}
          options={[
            { value: "login", label: T(l, "Кіру", "Вход") },
            { value: "register", label: T(l, "Тіркелу", "Регистрация") },
          ]}
        />
        <h1 className="mt-6 text-[22px] text-ink">{mode === "login" ? T(l, "Аккаунтқа кіру", "Вход в аккаунт") : T(l, "Аккаунт ашу", "Создать аккаунт")}</h1>
        <p className="mt-1 text-[15px] text-muted">
          {mode === "login"
            ? T(l, "Жоспарыңыз, прогресіңіз және пробный нәтижелеріңіз сізді күтіп тұр.", "Ваш план, прогресс и результаты пробников ждут вас.")
            : T(l, "Жоспар, прогресс және пробный нәтижелері барлық құрылғыда сақталады. Осы құрылғыдағы деректер аккаунтқа көшіріледі.", "План, прогресс и результаты пробников сохранятся на всех устройствах. Данные с этого устройства перенесутся в аккаунт.")}
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "register" && (
            <>
              <label className="block">
                <span className="text-[14px] font-extrabold text-ink">{T(l, "Атыңыз", "Имя")}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} className="mt-2 h-12 w-full rounded-2xl bg-card px-4 text-[16px] text-ink ring-line" />
              </label>
              <div>
                <span className="text-[14px] font-extrabold text-ink">{T(l, "Мен —", "Я —")}</span>
                <SegmentedControl className="mt-2" label={T(l, "Рөл", "Роль")} value={role} onChange={setRole} options={[{ value: "student", label: T(l, "Оқушымын", "Ученик") }, { value: "parent", label: T(l, "Ата-анамын", "Родитель") }]} />
              </div>
            </>
          )}
          <label className="block">
            <span className="text-[14px] font-extrabold text-ink">{T(l, "Электрондық пошта", "Электронная почта")}</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.kz" className="mt-2 h-12 w-full rounded-2xl bg-card px-4 text-[16px] text-ink ring-line placeholder:text-muted" />
          </label>
          <label className="block">
            <span className="text-[14px] font-extrabold text-ink">{T(l, "Құпиясөз", "Пароль")}</span>
            <span className="relative mt-2 block">
              <input
                type={show ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-12 w-full rounded-2xl bg-card pl-4 pr-12 text-[16px] text-ink ring-line"
              />
              <button type="button" onClick={() => setShow((x) => !x)} aria-label={show ? T(l, "Жасыру", "Скрыть") : T(l, "Көрсету", "Показать")} className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
            {mode === "register" && <span className="mt-1 block text-[12px] text-muted">{T(l, "Кемінде 8 таңба.", "Не короче 8 символов.")}</span>}
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-primary-tint p-3 text-[14px] font-bold text-primary-deep">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "…" : mode === "login" ? T(l, "Кіру", "Войти") : T(l, "Тіркелу", "Зарегистрироваться")}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          {mode === "login" ? T(l, "Құпиясөзді ұмыттыңыз ба? Жазыңыз:", "Забыли пароль? Напишите:") : T(l, "Сұрақ болса:", "Вопросы:")} {SUPPORT_EMAIL}
        </p>
        <p className="mt-8 text-center text-[12px] leading-5 text-muted">
          {T(l, "Тіркеле отырып, сіз ", "Регистрируясь, вы соглашаетесь с ")}
          <Link href={lp(l, "/terms")} className="underline">{T(l, "шарттармен", "условиями")}</Link>
          {T(l, " және ", " и ")}
          <Link href={lp(l, "/privacy")} className="underline">{T(l, "құпиялылық саясатымен", "политикой конфиденциальности")}</Link>
          {T(l, " келісесіз.", ".")}
        </p>
      </div>
    </MinimalShell>
  );
}
