/**
 * Bandeau image pleine largeur, sans texte. Il se colle en haut de l'écran :
 * la section suivante remonte ensuite par-dessus et le recouvre.
 */
export default function ImageBand() {
  return (
    <section aria-hidden className="relative sticky top-0 h-[46vh] sm:h-[58vh] overflow-hidden">
      <img
        src="/images/chantier-inspection.jpeg"
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/30" />
    </section>
  );
}
