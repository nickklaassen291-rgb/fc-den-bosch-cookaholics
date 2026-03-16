import { useState, useEffect } from "react";

const PRICING = {
  facilitair: {
    schoonmaak: 105,
    linnen: 2.50,
  },
  food: {
    tafelgarnituur: { inkoop: 0.70, factor: 4 },
    diner3gang: { inkoop: 8.50, factor: 3.5, label: "3-gangen diner" },
    diner4gang: { inkoop: 10.50, factor: 3.5, label: "4-gangen diner" },
  },
  drinks: {
    arrangement4uur: { inkoop: 6.00, factor: 4 },
  },
  crew: {
    kok: { tarief: 47.50, uren: 4.5 },
    kokVanaf30: { tarief: 47.50, uren: 4.5, minGasten: 30 },
    kokVanaf50: { tarief: 47.50, uren: 4.5, minGasten: 50 },
    pm: { tarief: 49.50, uren: 7 },
    bediening: { tarief: 38.50, uren: 7 },
    bedieningVanaf55: { tarief: 38.50, uren: 6, minGasten: 55 },
    bedieningVanaf65: { tarief: 38.50, uren: 6, minGasten: 65 },
  },
  reiskosten: [
    { min: 25, max: 29, kosten: 90 },
    { min: 30, max: 49, kosten: 120 },
    { min: 50, max: 59, kosten: 180 },
    { min: 60, max: 65, kosten: 210 },
  ],
  huurprijs: 395,
};

function berekenUren(startTijd, eindTijd) {
  const [sh, sm] = startTijd.split(":").map(Number);
  let [eh, em] = eindTijd.split(":").map(Number);
  if (eh === 0 && em === 0) eh = 24; // midnight
  return (eh + em / 60) - (sh + sm / 60);
}

function berekenPrijs(gasten, dinerType, tafelgarnituur, startTijd, eindTijd) {
  const eventUren = berekenUren(startTijd, eindTijd);
  const extraUren = Math.max(0, eventUren - 4);

  // Component: Food
  const diner = dinerType === "4gang" ? PRICING.food.diner4gang : PRICING.food.diner3gang;
  const foodKosten = diner.inkoop * diner.factor * gasten;
  const garnituurKosten = tafelgarnituur ? PRICING.food.tafelgarnituur.inkoop * PRICING.food.tafelgarnituur.factor * gasten : 0;

  // Component: Drinks
  const drinkenBasis = PRICING.drinks.arrangement4uur.inkoop * PRICING.drinks.arrangement4uur.factor * gasten;
  const drinkenExtra = extraUren * 5 * gasten;
  const drinkenKosten = drinkenBasis + drinkenExtra;

  // Component: Crew
  let crewKosten = 0;
  Object.values(PRICING.crew).forEach((crew) => {
    if (!crew.minGasten || gasten >= crew.minGasten) {
      crewKosten += crew.tarief * crew.uren;
    }
  });
  let aantalBediening = 1;
  if (gasten >= 65) aantalBediening = 3;
  else if (gasten >= 55) aantalBediening = 2;
  crewKosten += extraUren * PRICING.crew.bediening.tarief * aantalBediening;

  // Component: Facilitair
  const facilitairKosten = PRICING.facilitair.schoonmaak + (PRICING.facilitair.linnen * gasten);

  // Component: Reiskosten
  const reis = PRICING.reiskosten.find((r) => gasten >= r.min && gasten <= r.max);
  const reisKosten = reis ? reis.kosten : 0;

  // Component: Huur
  const huurKosten = PRICING.huurprijs;

  const totaal = foodKosten + garnituurKosten + drinkenKosten + crewKosten + facilitairKosten + reisKosten;
  const totaalInclHuur = totaal + huurKosten;

  return {
    totaal: Math.round(totaal * 100) / 100,
    totaalPP: Math.round((totaalInclHuur / gasten) * 100) / 100,
    totaalInclHuur: Math.round(totaalInclHuur * 100) / 100,
    eventUren,
    extraUren,
    breakdown: {
      food: Math.round(foodKosten * 100) / 100,
      foodPP: Math.round((foodKosten / gasten) * 100) / 100,
      garnituur: Math.round(garnituurKosten * 100) / 100,
      garnituurPP: tafelgarnituur ? Math.round((garnituurKosten / gasten) * 100) / 100 : 0,
      drinken: Math.round(drinkenKosten * 100) / 100,
      drinkenPP: Math.round((drinkenKosten / gasten) * 100) / 100,
      crew: Math.round(crewKosten * 100) / 100,
      crewPP: Math.round((crewKosten / gasten) * 100) / 100,
      facilitair: Math.round(facilitairKosten * 100) / 100,
      facilitairPP: Math.round((facilitairKosten / gasten) * 100) / 100,
      reis: Math.round(reisKosten * 100) / 100,
      reisPP: Math.round((reisKosten / gasten) * 100) / 100,
      huur: huurKosten,
      huurPP: Math.round((huurKosten / gasten) * 100) / 100,
    },
  };
}

const steps = ["evenement", "gasten", "menu", "tijd", "extras", "overzicht", "gegevens"];
const stepLabels = ["Type", "Gasten", "Menu", "Tijden", "Extra's", "Overzicht", "Gegevens"];

export default function Villa1855Calculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "",
    gasten: 40,
    dinerType: "3gang",
    startTijd: "18:00",
    eindTijd: "22:00",
    tafelgarnituur: true,
    naam: "",
    email: "",
    telefoon: "",
    datum: "",
    opmerkingen: "",
  });

  const eventTypes = [
    { id: "personeelsfeest", label: "Personeelsfeest", icon: "🎉", desc: "Vier je team in stijl" },
    { id: "zakelijk-diner", label: "Zakelijk diner", icon: "🍽", desc: "Imponeer relaties" },
    { id: "netwerkborrel", label: "Netwerkborrel", icon: "🥂", desc: "Verbind en inspireer" },
    { id: "jubileum", label: "Jubileum", icon: "✨", desc: "Vier de mijlpaal" },
  ];

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (formData.naam && formData.email) {
      setAnimating(true);
      setTimeout(() => {
        setSubmitted(true);
        setAnimating(false);
      }, 300);
    }
  };

  const prijs = berekenPrijs(formData.gasten, formData.dinerType, formData.tafelgarnituur, formData.startTijd, formData.eindTijd);
  const eventUren = berekenUren(formData.startTijd, formData.eindTijd);
  const canProceed =
    currentStep === 0 ? formData.eventType !== "" :
    currentStep === 3 ? eventUren >= 4 :
    currentStep === 6 ? formData.naam !== "" && formData.email !== "" :
    true;

  if (submitted) {
    const bd = prijs.breakdown;
    const breakdownItems = [
      { label: formData.dinerType === "4gang" ? "4-gangen diner" : "3-gangen diner", sublabel: "Incl. amuse, brood & boter", pp: bd.foodPP, total: bd.food },
      ...(formData.tafelgarnituur ? [{ label: "Tafelgarnituur ontvangst", sublabel: "Hapjes bij binnenkomst", pp: bd.garnituurPP, total: bd.garnituur }] : []),
      { label: `${prijs.eventUren}-uurs drankpakket`, sublabel: prijs.extraUren > 0 ? `Basis 4 uur + ${prijs.extraUren} uur verlenging` : "Bier, wijn, fris & warm", pp: bd.drinkenPP, total: bd.drinken },
      { label: "Serviceteam", sublabel: "Kok(s), partymanager & bediening", pp: Math.round((bd.crew + bd.reis) / formData.gasten * 100) / 100, total: Math.round(bd.crew + bd.reis) },
      { label: "Facilitair", sublabel: "Linnen, servies & schoonmaak", pp: bd.facilitairPP, total: bd.facilitair },
      { label: "Locatiehuur Villa 1855", sublabel: "Exclusief gebruik van de villa", pp: bd.huurPP, total: bd.huur },
    ];

    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.confirmContainer}>
            <div style={styles.checkmark}>✓</div>
            <h2 style={styles.confirmTitle}>Bedankt, {formData.naam.split(" ")[0]}!</h2>
            <p style={styles.confirmText}>
              Hier is je persoonlijke prijsindicatie voor{" "}
              <strong>{eventTypes.find((e) => e.id === formData.eventType)?.label.toLowerCase()}</strong>{" "}
              bij Villa 1855.
            </p>

            {/* Price header */}
            <div style={styles.priceHeaderBox}>
              <div style={styles.priceHeaderLabel}>Totale investering</div>
              <div style={styles.priceHeaderAmount}>
                €{prijs.totaalPP.toFixed(0)}
                <span style={styles.priceHeaderPer}> per persoon</span>
              </div>
              <div style={styles.priceHeaderTotal}>
                €{prijs.totaalInclHuur.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} totaal voor {formData.gasten} gasten • {formData.startTijd} – {formData.eindTijd}
              </div>
            </div>

            {/* Breakdown */}
            <div style={styles.breakdownBox}>
              <div style={styles.breakdownTitle}>Prijsopbouw</div>
              {breakdownItems.map((item, i) => (
                <div key={i}>
                  <div style={styles.breakdownRow}>
                    <div style={styles.breakdownLeft}>
                      <div style={styles.breakdownLabel}>{item.label}</div>
                      {item.sublabel && <div style={styles.breakdownSub}>{item.sublabel}</div>}
                    </div>
                    <div style={styles.breakdownRight}>
                      <div style={styles.breakdownPP}>€{item.pp.toFixed(2)} pp</div>
                      <div style={styles.breakdownTotal}>€{item.total.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>
                  {i < breakdownItems.length - 1 && <div style={styles.breakdownDivider} />}
                </div>
              ))}
              <div style={styles.breakdownTotalRow}>
                <div style={styles.breakdownTotalLabel}>Totaal all-in</div>
                <div style={styles.breakdownTotalAmount}>
                  €{prijs.totaalInclHuur.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            <div style={styles.confirmCTABox}>
              <div style={styles.confirmCTATitle}>Wil je dit bespreken?</div>
              <p style={styles.confirmCTAText}>
                Eén van onze eventplanners neemt binnen 24 uur contact met je op
                om je wensen te bespreken en een offerte op maat te maken.
              </p>
            </div>

            <p style={styles.disclaimerText}>
              * Dit is een indicatie op basis van standaardtarieven. De definitieve offerte kan afwijken op basis van specifieke wensen, seizoen en beschikbaarheid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoText}>VILLA 1855</div>
          <p style={styles.headerSub}>Configureer je evenement — ontvang direct je prijsindicatie</p>
        </div>

        {/* Progress */}
        <div style={styles.progressContainer}>
          {stepLabels.map((label, i) => (
            <div key={i} style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressDot,
                  ...(i <= currentStep ? styles.progressDotActive : {}),
                  ...(i < currentStep ? styles.progressDotDone : {}),
                }}
              >
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span
                style={{
                  ...styles.progressLabel,
                  ...(i <= currentStep ? styles.progressLabelActive : {}),
                }}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  style={{
                    ...styles.progressLine,
                    ...(i < currentStep ? styles.progressLineActive : {}),
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            ...styles.content,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Step 1: Event Type */}
          {currentStep === 0 && (
            <div>
              <h3 style={styles.stepTitle}>Wat voor evenement wordt het?</h3>
              <div style={styles.eventGrid}>
                {eventTypes.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => setFormData({ ...formData, eventType: evt.id })}
                    style={{
                      ...styles.eventCard,
                      ...(formData.eventType === evt.id ? styles.eventCardActive : {}),
                    }}
                  >
                    <span style={styles.eventIcon}>{evt.icon}</span>
                    <span style={styles.eventLabel}>{evt.label}</span>
                    <span style={styles.eventDesc}>{evt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Gasten */}
          {currentStep === 1 && (
            <div>
              <h3 style={styles.stepTitle}>Hoeveel gasten verwacht je?</h3>
              <div style={styles.sliderContainer}>
                <div style={styles.gastenDisplay}>{formData.gasten}</div>
                <div style={styles.gastenUnit}>personen</div>
                <input
                  type="range"
                  min={25}
                  max={65}
                  step={5}
                  value={formData.gasten}
                  onChange={(e) => setFormData({ ...formData, gasten: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <div style={styles.sliderLabels}>
                  <span>25</span>
                  <span>45</span>
                  <span>65</span>
                </div>
              </div>
              <div style={styles.hint}>
                💡 Bij {formData.gasten >= 50 ? "50+" : "grotere"} groepen daalt de prijs per persoon door gedeelde vaste kosten
              </div>
            </div>
          )}

          {/* Step 3: Menu */}
          {currentStep === 2 && (
            <div>
              <h3 style={styles.stepTitle}>Kies je menu</h3>
              <div style={styles.menuOptions}>
                <button
                  onClick={() => setFormData({ ...formData, dinerType: "3gang" })}
                  style={{
                    ...styles.menuCard,
                    ...(formData.dinerType === "3gang" ? styles.menuCardActive : {}),
                  }}
                >
                  <div style={styles.menuBadge}>Populair</div>
                  <div style={styles.menuName}>3-Gangen Diner</div>
                  <div style={styles.menuDesc}>
                    Amuse • Brood & boter • Voorgerecht • Hoofdgerecht • Dessert
                  </div>
                  <div style={styles.menuIncludes}>Incl. 4-uurs drankpakket</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, dinerType: "4gang" })}
                  style={{
                    ...styles.menuCard,
                    ...(formData.dinerType === "4gang" ? styles.menuCardActive : {}),
                  }}
                >
                  <div style={{ ...styles.menuBadge, background: "#8B7355" }}>Premium</div>
                  <div style={styles.menuName}>4-Gangen Diner</div>
                  <div style={styles.menuDesc}>
                    Amuse • Brood & boter • Voorgerecht • Tussengerecht • Hoofdgerecht • Dessert
                  </div>
                  <div style={styles.menuIncludes}>Incl. 4-uurs drankpakket</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Tijden */}
          {currentStep === 3 && (
            <div>
              <h3 style={styles.stepTitle}>Hoe laat wordt het feest?</h3>
              <p style={styles.stepSubtitle}>
                Het standaard arrangement duurt 4 uur. Langer feesten kan natuurlijk ook.
              </p>

              <div style={styles.timeContainer}>
                <div style={styles.timeGroup}>
                  <label style={styles.timeLabel}>Start evenement</label>
                  <div style={styles.timeOptions}>
                    {["17:00", "17:30", "18:00", "18:30", "19:00"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, startTijd: t })}
                        style={{
                          ...styles.timeBtn,
                          ...(formData.startTijd === t ? styles.timeBtnActive : {}),
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.timeDividerVertical}>
                  <div style={styles.timeDuration}>
                    {berekenUren(formData.startTijd, formData.eindTijd)} uur
                  </div>
                </div>

                <div style={styles.timeGroup}>
                  <label style={styles.timeLabel}>Einde evenement</label>
                  <div style={styles.timeOptions}>
                    {["21:00", "22:00", "23:00", "00:00"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, eindTijd: t })}
                        style={{
                          ...styles.timeBtn,
                          ...(formData.eindTijd === t ? styles.timeBtnActive : {}),
                        }}
                      >
                        {t === "00:00" ? "00:00" : t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {berekenUren(formData.startTijd, formData.eindTijd) > 4 && (
                <div style={styles.hint}>
                  ⏱ Je hebt {berekenUren(formData.startTijd, formData.eindTijd) - 4} uur extra gekozen
                  — het drankpakket en de bediening worden verlengd.
                </div>
              )}

              {berekenUren(formData.startTijd, formData.eindTijd) < 4 && (
                <div style={{ ...styles.hint, borderColor: "#e8c8c8", background: "#fdf0f0", color: "#8b5555" }}>
                  ⚠ Het minimale arrangement is 4 uur. Kies een langere tijdspanne.
                </div>
              )}
            </div>
          )}

          {/* Step 5: Extras */}
          {currentStep === 4 && (
            <div>
              <h3 style={styles.stepTitle}>Wil je extras toevoegen?</h3>
              <div style={styles.extrasContainer}>
                <label style={styles.extraOption}>
                  <div style={styles.extraLeft}>
                    <input
                      type="checkbox"
                      checked={formData.tafelgarnituur}
                      onChange={(e) =>
                        setFormData({ ...formData, tafelgarnituur: e.target.checked })
                      }
                      style={styles.checkbox}
                    />
                    <div>
                      <div style={styles.extraName}>Tafelgarnituur bij ontvangst</div>
                      <div style={styles.extraDesc}>
                        Hapjes en garnituur bij binnenkomst voor een warm welkom
                      </div>
                    </div>
                  </div>
                  <div style={styles.extraPrice}>+ €2,80 pp</div>
                </label>
              </div>
              <div style={styles.hint}>
                💡 Wil je andere extra's zoals decoratie of entertainment? Dat bespreken we graag persoonlijk.
              </div>
            </div>
          )}

          {/* Step 6: Overview - what's included */}
          {currentStep === 5 && (
            <div>
              <h3 style={styles.stepTitle}>Dit is wat je krijgt</h3>
              <p style={styles.stepSubtitle}>
                Alles voor een zorgeloos {eventTypes.find((e) => e.id === formData.eventType)?.label.toLowerCase()} bij Villa 1855.
              </p>

              <div style={styles.overviewGrid}>
                <div style={styles.overviewCard}>
                  <div style={styles.overviewIcon}>🍽</div>
                  <div style={styles.overviewCardTitle}>
                    {formData.dinerType === "4gang" ? "4-Gangen" : "3-Gangen"} Diner
                  </div>
                  <div style={styles.overviewCardDesc}>
                    Amuse, brood & boter{formData.dinerType === "4gang" ? ", voor-, tussen-, hoofd- & nagerecht" : ", voor-, hoofdgerecht & dessert"}
                  </div>
                </div>

                <div style={styles.overviewCard}>
                  <div style={styles.overviewIcon}>🥂</div>
                  <div style={styles.overviewCardTitle}>{prijs.eventUren}-Uurs Drankpakket</div>
                  <div style={styles.overviewCardDesc}>
                    Bier, wijn, fris en warme dranken{prijs.extraUren > 0 ? ` — inclusief ${prijs.extraUren} uur verlenging` : " de hele avond door"}
                  </div>
                </div>

                <div style={styles.overviewCard}>
                  <div style={styles.overviewIcon}>👨‍🍳</div>
                  <div style={styles.overviewCardTitle}>Professioneel Team</div>
                  <div style={styles.overviewCardDesc}>
                    Kok(s), partymanager en bediening — afgestemd op {formData.gasten} gasten
                  </div>
                </div>

                <div style={styles.overviewCard}>
                  <div style={styles.overviewIcon}>📍</div>
                  <div style={styles.overviewCardTitle}>Villa 1855</div>
                  <div style={styles.overviewCardDesc}>
                    Monumentale locatie in het hart van Tilburg, inclusief huur
                  </div>
                </div>

                {formData.tafelgarnituur && (
                  <div style={styles.overviewCard}>
                    <div style={styles.overviewIcon}>✨</div>
                    <div style={styles.overviewCardTitle}>Ontvangst Garnituur</div>
                    <div style={styles.overviewCardDesc}>
                      Hapjes en tafelgarnituur bij binnenkomst
                    </div>
                  </div>
                )}

                <div style={styles.overviewCard}>
                  <div style={styles.overviewIcon}>🧹</div>
                  <div style={styles.overviewCardTitle}>Ontzorging</div>
                  <div style={styles.overviewCardDesc}>
                    Linnen, servies, schoonmaak — jullie hoeven niets te regelen
                  </div>
                </div>
              </div>

              <div style={styles.previewBox}>
                <div style={styles.previewLabel}>Jouw evenement</div>
                <div style={styles.previewSummaryList}>
                  <div style={styles.previewSummaryRow}>
                    <span style={styles.previewSummaryIcon}>👥</span>
                    <span style={styles.previewSummaryText}>{formData.gasten} gasten</span>
                  </div>
                  <div style={styles.previewSummaryRow}>
                    <span style={styles.previewSummaryIcon}>🕕</span>
                    <span style={styles.previewSummaryText}>{formData.startTijd} – {formData.eindTijd} ({prijs.eventUren} uur{prijs.extraUren > 0 ? `, incl. ${prijs.extraUren} uur extra` : ""})</span>
                  </div>
                </div>
                <div style={styles.previewCTA}>
                  Nog één stap — ontvang je persoonlijke prijsindicatie →
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Contact */}
          {currentStep === 6 && (
            <div>
              <h3 style={styles.stepTitle}>Bijna klaar!</h3>
              <p style={styles.stepSubtitle}>
                Vul je gegevens in en ontvang binnen 5 minuten je persoonlijke prijsindicatie.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Naam *</label>
                  <input
                    type="text"
                    placeholder="Jan de Vries"
                    value={formData.naam}
                    onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mailadres *</label>
                  <input
                    type="email"
                    placeholder="jan@bedrijf.nl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefoonnummer</label>
                  <input
                    type="tel"
                    placeholder="06 - 1234 5678"
                    value={formData.telefoon}
                    onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gewenste datum</label>
                  <input
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bijzonderheden of wensen</label>
                <textarea
                  placeholder="Vertel ons over je evenement..."
                  value={formData.opmerkingen}
                  onChange={(e) => setFormData({ ...formData, opmerkingen: e.target.value })}
                  style={styles.textarea}
                  rows={3}
                />
              </div>
              <p style={styles.privacy}>
                🔒 We delen je gegevens nooit met derden. Je ontvangt alleen je prijsindicatie.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navBar}>
          {currentStep > 0 && (
            <button onClick={goBack} style={styles.backBtn}>
              ← Vorige
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < steps.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              style={{
                ...styles.nextBtn,
                ...(!canProceed ? styles.btnDisabled : {}),
              }}
            >
              Volgende →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed}
              style={{
                ...styles.submitBtn,
                ...(!canProceed ? styles.btnDisabled : {}),
              }}
            >
              Ontvang mijn prijsindicatie
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(165deg, #1a1a1a 0%, #2d2418 50%, #1a1a1a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  },
  card: {
    background: "#faf8f5",
    borderRadius: "16px",
    maxWidth: "640px",
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
  },
  header: {
    background: "linear-gradient(135deg, #2d2418 0%, #3d3225 100%)",
    padding: "32px 32px 24px",
    textAlign: "center",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: "300",
    letterSpacing: "6px",
    color: "#c9a96e",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    marginTop: "8px",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 32px 8px",
    gap: "0px",
  },
  progressStep: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    position: "relative",
    flex: 1,
  },
  progressDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid #d4cfc8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    color: "#999",
    background: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.3s ease",
    zIndex: 1,
  },
  progressDotActive: {
    border: "2px solid #c9a96e",
    color: "#c9a96e",
    fontWeight: "600",
  },
  progressDotDone: {
    background: "#c9a96e",
    border: "2px solid #c9a96e",
    color: "#fff",
  },
  progressLabel: {
    fontSize: "11px",
    color: "#999",
    marginTop: "6px",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  progressLabelActive: {
    color: "#2d2418",
    fontWeight: "600",
  },
  progressLine: {
    position: "absolute",
    top: "16px",
    left: "calc(50% + 20px)",
    width: "calc(100% - 40px)",
    height: "2px",
    background: "#e5e0d8",
    zIndex: 0,
  },
  progressLineActive: {
    background: "#c9a96e",
  },
  content: {
    padding: "24px 32px",
    minHeight: "320px",
  },
  stepTitle: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#2d2418",
    marginBottom: "20px",
    lineHeight: 1.3,
  },
  stepSubtitle: {
    fontSize: "15px",
    color: "#6b5e50",
    marginBottom: "24px",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  eventCard: {
    background: "#fff",
    border: "2px solid #e8e3dc",
    borderRadius: "12px",
    padding: "20px 16px",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  eventCardActive: {
    borderColor: "#c9a96e",
    background: "#fdf8f0",
    boxShadow: "0 0 0 1px #c9a96e",
  },
  eventIcon: {
    fontSize: "28px",
  },
  eventLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  eventDesc: {
    fontSize: "13px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
  },
  sliderContainer: {
    textAlign: "center",
    padding: "20px 0",
  },
  gastenDisplay: {
    fontSize: "72px",
    fontWeight: "300",
    color: "#2d2418",
    lineHeight: 1,
  },
  gastenUnit: {
    fontSize: "16px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "24px",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    outline: "none",
    appearance: "auto",
    accentColor: "#c9a96e",
    cursor: "pointer",
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#999",
    marginTop: "8px",
    fontFamily: "'DM Sans', sans-serif",
  },
  hint: {
    background: "#fdf8f0",
    border: "1px solid #e8dcc8",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#8b7355",
    marginTop: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  menuOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  menuCard: {
    background: "#fff",
    border: "2px solid #e8e3dc",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    width: "100%",
  },
  menuCardActive: {
    borderColor: "#c9a96e",
    background: "#fdf8f0",
    boxShadow: "0 0 0 1px #c9a96e",
  },
  menuBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#c9a96e",
    color: "#fff",
    fontSize: "11px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  menuName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d2418",
    marginBottom: "8px",
  },
  menuDesc: {
    fontSize: "14px",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
  },
  menuIncludes: {
    fontSize: "12px",
    color: "#c9a96e",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    marginTop: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  extrasContainer: {
    background: "#fff",
    border: "1px solid #e8e3dc",
    borderRadius: "12px",
    padding: "20px",
  },
  extraOption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    padding: "4px 0",
  },
  extraLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    accentColor: "#c9a96e",
    cursor: "pointer",
  },
  extraName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  extraDesc: {
    fontSize: "13px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "2px",
  },
  extraPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#c9a96e",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  extraDivider: {
    height: "1px",
    background: "#e8e3dc",
    margin: "16px 0",
  },
  includedSection: {
    padding: "4px 0",
  },
  includedTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "10px",
  },
  includedList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
  includedItem: {
    fontSize: "13px",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
  },
  previewBox: {
    background: "linear-gradient(135deg, #2d2418 0%, #3d3225 100%)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    marginTop: "16px",
  },
  previewLabel: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  previewPrice: {
    fontSize: "42px",
    fontWeight: "300",
    color: "#c9a96e",
    marginTop: "4px",
    lineHeight: 1.2,
  },
  previewPer: {
    fontSize: "16px",
    color: "rgba(201,169,110,0.7)",
  },
  previewTotal: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "8px",
  },
  previewSummaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "12px",
  },
  previewSummaryRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  previewSummaryIcon: {
    fontSize: "16px",
    width: "24px",
    textAlign: "center",
  },
  previewSummaryText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    fontFamily: "'DM Sans', sans-serif",
  },
  previewCTA: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
    color: "#c9a96e",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  overviewCard: {
    background: "#fff",
    border: "1px solid #e8e3dc",
    borderRadius: "10px",
    padding: "16px",
  },
  overviewIcon: {
    fontSize: "22px",
    marginBottom: "8px",
  },
  overviewCardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "4px",
  },
  overviewCardDesc: {
    fontSize: "12px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.4,
  },
  timeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  timeGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "10px",
    display: "block",
  },
  timeOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  timeBtn: {
    background: "#fff",
    border: "2px solid #e8e3dc",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "16px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    color: "#2d2418",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  timeBtnActive: {
    borderColor: "#c9a96e",
    background: "#fdf8f0",
    boxShadow: "0 0 0 1px #c9a96e",
    color: "#8b7355",
    fontWeight: "700",
  },
  timeDividerVertical: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 8px 0",
  },
  timeDuration: {
    background: "linear-gradient(135deg, #2d2418 0%, #3d3225 100%)",
    color: "#c9a96e",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "'DM Sans', sans-serif",
    padding: "8px 16px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  priceRevealContainer: {
    textAlign: "center",
    padding: "16px 0 12px",
  },
  priceRevealAmount: {
    fontSize: "36px",
    fontWeight: "300",
    color: "#c9a96e",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    lineHeight: 1.2,
  },
  priceRevealPer: {
    fontSize: "16px",
    color: "#8b7e70",
  },
  priceRevealTotal: {
    fontSize: "14px",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "4px",
  },
  priceRevealDivider: {
    height: "1px",
    background: "#e8e3dc",
    margin: "14px 0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "4px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e8e3dc",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#2d2418",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#fff",
  },
  textarea: {
    padding: "12px 16px",
    border: "2px solid #e8e3dc",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#2d2418",
    outline: "none",
    resize: "vertical",
    background: "#fff",
  },
  privacy: {
    fontSize: "12px",
    color: "#999",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "12px",
  },
  navBar: {
    display: "flex",
    alignItems: "center",
    padding: "16px 32px 24px",
    gap: "12px",
  },
  backBtn: {
    background: "none",
    border: "2px solid #d4cfc8",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    color: "#6b5e50",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  nextBtn: {
    background: "#c9a96e",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "15px",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    transition: "all 0.2s",
    letterSpacing: "0.3px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #c9a96e 0%, #a88a4e 100%)",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "15px",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "600",
    transition: "all 0.2s",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 16px rgba(201,169,110,0.3)",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  confirmContainer: {
    padding: "48px 32px",
    textAlign: "center",
  },
  checkmark: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c9a96e 0%, #a88a4e 100%)",
    color: "#fff",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  confirmTitle: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#2d2418",
    marginBottom: "8px",
  },
  confirmText: {
    fontSize: "15px",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
  },
  summaryBox: {
    background: "#f5f1eb",
    borderRadius: "12px",
    padding: "20px",
    margin: "24px 0",
    textAlign: "left",
  },
  summaryTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#999",
    fontFamily: "'DM Sans', sans-serif",
  },
  summaryValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  confirmNote: {
    fontSize: "14px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    fontStyle: "italic",
  },
  priceHeaderBox: {
    background: "linear-gradient(135deg, #2d2418 0%, #3d3225 100%)",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    margin: "20px 0 16px",
  },
  priceHeaderLabel: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  priceHeaderAmount: {
    fontSize: "48px",
    fontWeight: "300",
    color: "#c9a96e",
    lineHeight: 1.2,
    marginTop: "4px",
  },
  priceHeaderPer: {
    fontSize: "18px",
    color: "rgba(201,169,110,0.7)",
  },
  priceHeaderTotal: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "8px",
  },
  breakdownBox: {
    background: "#fff",
    border: "1px solid #e8e3dc",
    borderRadius: "12px",
    padding: "20px",
    margin: "0 0 16px",
    textAlign: "left",
  },
  breakdownTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "14px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "8px 0",
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  breakdownSub: {
    fontSize: "12px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "1px",
  },
  breakdownRight: {
    textAlign: "right",
    flexShrink: 0,
    marginLeft: "16px",
  },
  breakdownPP: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  breakdownTotal: {
    fontSize: "12px",
    color: "#8b7e70",
    fontFamily: "'DM Sans', sans-serif",
  },
  breakdownDivider: {
    height: "1px",
    background: "#f0ece6",
    margin: "2px 0",
  },
  breakdownTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0 0",
    marginTop: "10px",
    borderTop: "2px solid #2d2418",
  },
  breakdownTotalLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  breakdownTotalAmount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
  },
  confirmCTABox: {
    background: "#fdf8f0",
    border: "1px solid #e8dcc8",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "12px",
  },
  confirmCTATitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d2418",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "6px",
  },
  confirmCTAText: {
    fontSize: "13px",
    color: "#6b5e50",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
    margin: 0,
  },
  disclaimerText: {
    fontSize: "11px",
    color: "#b0a898",
    fontFamily: "'DM Sans', sans-serif",
    textAlign: "center",
    lineHeight: 1.4,
  },
};
