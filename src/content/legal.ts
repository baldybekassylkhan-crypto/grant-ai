import type { ProseSection } from "@/components/shell/ProsePage";
import type { Locale } from "@/lib/i18n";
import { PARTNER_EMAIL, SUPPORT_EMAIL } from "@/lib/site";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

export const supportSections = (l: Locale): ProseSection[] => [
  {
    id: "contact-us",
    heading: T(l, "Бізбен байланыс", "Связаться с нами"),
    body: [
      T(l, `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> адресіне жазыңыз — [RESPONSE TIME] ішінде жауап береміз.`, `Пишите на <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> — ответим в течение [RESPONSE TIME].`),
      T(l, "Аккаунт поштаңызды және мәселенің қысқаша сипаттамасын көрсетіңіз.", "Укажите почту аккаунта и коротко опишите проблему."),
    ],
  },
  {
    id: "official",
    heading: T(l, "ҰБТ-ға тіркелу және нәтижелер", "Регистрация на ЕНТ и результаты"),
    body: [
      T(l, 'ҰБТ-ға тіркелу, нәтижелер және апелляция бойынша Ұлттық тестілеу орталығына хабарласыңыз: <a href="https://testcenter.kz">testcenter.kz</a>. grant.ai бұл мәселелерді шешпейді.', 'По вопросам регистрации на ЕНТ, результатов и апелляций обращайтесь в Национальный центр тестирования: <a href="https://testcenter.kz">testcenter.kz</a>. grant.ai эти вопросы не решает.'),
    ],
  },
  {
    id: "manage-subscription",
    heading: T(l, "Жазылымды басқару немесе тоқтату", "Управление подпиской и отмена"),
    body: [
      T(l, "Жоспарды кез келген уақытта аккаунт баптауларынан өзгертуге немесе тоқтатуға болады:", "Изменить или отменить план можно в любой момент в настройках аккаунта:"),
      { list: [T(l, "grant.ai-ға кіріңіз.", "Войдите в grant.ai."), T(l, "Аккаунт → Жазылым бөлімін ашыңыз.", "Откройте Аккаунт → Подписка."), T(l, "«Жоспарды өзгерту» немесе «Тоқтату» таңдаңыз.", "Выберите «Сменить план» или «Отменить».")], ordered: true },
      "[SUBSCRIPTION DETAILS]",
    ],
  },
  {
    id: "refunds",
    heading: T(l, "Ақшаны қайтару", "Возврат средств"),
    body: [T(l, `Толығырақ: <a href="/${l}/refund">қайтару саясаты</a>. Кепілдік бойынша — <a href="/${l}/guarantee">кепілдік беті</a>.`, `Подробнее: <a href="/${l}/refund">политика возврата</a>. По гарантии — <a href="/${l}/guarantee">страница гарантии</a>.`)],
  },
  {
    id: "delete-account",
    heading: T(l, "Аккаунтты жою", "Удаление аккаунта"),
    body: [T(l, `Аккаунт поштасынан ${SUPPORT_EMAIL} адресіне «Аккаунтты жою» тақырыбымен жазыңыз.`, `Напишите с почты аккаунта на ${SUPPORT_EMAIL} с темой «Удалить аккаунт».`), "[DELETION TIMELINE AND DETAILS]"],
  },
  {
    id: "for-parents",
    heading: T(l, "Ата-аналарға", "Родителям"),
    body: [T(l, "Баланың прогресін қалай көруге және төлемді қалай басқаруға болады. [PARENT ACCESS DETAILS]", "Как смотреть прогресс ребёнка и управлять оплатой. [PARENT ACCESS DETAILS]")],
  },
  { id: "mobile-app", heading: T(l, "Мобильді қосымша", "Мобильное приложение"), body: ["[MOBILE APP DETAILS]"] },
  {
    id: "partners",
    heading: T(l, "Мектептер мен репетиторларға", "Школам и репетиторам"),
    body: [T(l, `Серіктестік бойынша: ${PARTNER_EMAIL}. [PARTNER PROGRAMME DETAILS]`, `По партнёрству: ${PARTNER_EMAIL}. [PARTNER PROGRAMME DETAILS]`)],
  },
];

const legal = (headings: string[]): ProseSection[] => headings.map((h) => ({ heading: h, body: ["[LEGAL COPY]", { list: ["[LEGAL COPY]", "[LEGAL COPY]"] }] }));

const requisites = (l: Locale): ProseSection => ({
  heading: T(l, "Деректемелер", "Реквизиты"),
  body: [T(l, "[COMPANY NAME], БСН [BIN], мекенжай: [ADDRESS], Қазақстан Республикасы.", "[COMPANY NAME], БИН [BIN], адрес: [ADDRESS], Республика Казахстан.")],
});

export const LEGAL = {
  terms: (l: Locale) => [...legal(l === "kk" ? ["1. Жалпы ережелер", "2. Аккаунт", "3. Қызметті пайдалану", "4. Төлем", "5. Жауапкершілік", "6. Өзгерістер"] : ["1. Общие положения", "2. Аккаунт", "3. Использование сервиса", "4. Оплата", "5. Ответственность", "6. Изменения"]), requisites(l)],
  privacy: (l: Locale) => [...legal(l === "kk" ? ["Қандай деректер жинаймыз", "Деректерді қалай қолданамыз", "Кімге береміз", "Қанша уақыт сақтаймыз", "Сіздің құқықтарыңыз", "Cookie"] : ["Какие данные мы собираем", "Как мы их используем", "Кому передаём", "Сколько храним", "Ваши права", "Cookie"]), requisites(l)],
  refund: (l: Locale) => [...legal(l === "kk" ? ["Жалпы ережелер", "Қайтару шарттары", "Өтінім беру тәртібі", "Кепілдік бойынша өтінімдер", "Қарау мерзімі"] : ["Общие положения", "Условия возврата", "Как подать заявку", "Заявки по гарантии", "Сроки рассмотрения"]), requisites(l)],
};
