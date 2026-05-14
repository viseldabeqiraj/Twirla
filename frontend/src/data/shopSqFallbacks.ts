import type { ShopCampaignPageConfig } from '../types/ShopCampaign';
import type {
  FAQItemConfig,
  FeaturedProductConfig,
  ParticlesBackgroundConfig,
  TestimonialConfig,
  TrustBadgeConfig,
} from '../types/ShopLandingConfig';
import type {
  CountdownConfig,
  MemoryMatchConfig,
  PrizeConfig,
  ScratchConfig,
  TapHeartsConfig,
  TextConfig,
} from '../types/ShopConfig';

/** Campaign fields merged onto English JSON; arrays are partial-by-index overlays. */
export type ShopSqCampaignPatch = Partial<
  Omit<ShopCampaignPageConfig, 'featuredProducts' | 'testimonials' | 'trustBadges' | 'faq'>
> & {
  featuredProducts?: Partial<FeaturedProductConfig>[];
  testimonials?: Partial<TestimonialConfig>[];
  trustBadges?: Partial<TrustBadgeConfig>[];
  faq?: Partial<FAQItemConfig>[];
  particlesBackground?: Partial<ParticlesBackgroundConfig>;
};

export type ShopSqFallback = {
  text?: Partial<TextConfig>;
  wheelPrizes?: Partial<PrizeConfig>[];
  tapHearts?: Partial<TapHeartsConfig>;
  scratch?: Partial<ScratchConfig>;
  countdown?: Partial<Pick<CountdownConfig, 'endMessage'>>;
  memory?: Partial<Pick<MemoryMatchConfig, 'revealText' | 'revealSubtitle'>>;
  campaign?: ShopSqCampaignPatch;
};

export const SHOP_SQ_FALLBACKS: Record<string, ShopSqFallback> = {
  pinkster: {
    memory: {
      revealSubtitle: '10% zbritje — na shkruaj në Instagram me këtë kod.',
    },
    campaign: {
      featuredSectionTitle: 'Zgjedhjet e veçanta',
      gamesSectionTitle: 'Luaj dhe fito',
      trustBadges: [{ label: 'Dërgesë e shpejtë' }, { label: 'Pagesë e sigurt' }],
    },
  },
  fashionista: {
    text: {
      title: 'Prek zemrat!',
      subtitle: 'Prek 12 zemra për të zbuluar surprizën',
      ctaText: 'Bli tani',
      resultTitle: 'Bravo!',
      resultSubtitle: 'Faleminderit për dashurinë!',
    },
    wheelPrizes: [
      { label: '15% zbritje', description: '15% zbritje për gjithë porosinë' },
      { label: '25% zbritje', description: '25% zbritje për gjithë porosinë' },
      { label: 'Dhuratë falas', description: 'Dhuratë falas me blerje' },
      { label: '50% zbritje', description: '50% zbritje për një artikull' },
      { label: 'Transport falas', description: 'Transport falas për porosinë' },
      { label: 'Provo përsëri', description: 'Fat më të mirë herën tjetër!' },
    ],
    tapHearts: {
      revealText: 'Ke hapur një zbritje speciale!',
      revealSubtitle: 'Përdor kodin FASHION20 për 20% zbritje',
    },
    scratch: {
      overlayText: 'Gërvisht këtu!',
      revealText: 'Fitove 30% zbritje!',
      revealSubtitle: 'Përdor kodin FASHION30 në checkout',
    },
    countdown: {
      endMessage: 'Oferta është aktive! Bli tani para se të mbarojë!',
    },
    memory: {
      revealSubtitle: '12% zbritje — na shkruaj Fashionistas me këtë kod.',
    },
  },
  demo: {
    text: {
      title: 'Provo çdo lojë Twirla',
      subtitle: 'Rrotulla, kap çmimin, gërvisht, numërimi dhe kujtesa — të njëjtat hapa si në lidhjet e dyqaneve.',
      ctaText: 'Vizito Twirla',
      resultTitle: 'Fitove!',
      resultSubtitle: 'Faleminderit që luajte.',
    },
    wheelPrizes: [
      { label: '10% zbritje', description: '10% zbritje' },
      { label: '20% zbritje', description: '20% zbritje' },
      { label: 'Transport falas', description: 'Transport falas' },
      { label: 'Provo përsëri', description: 'Provo përsëri!' },
    ],
    tapHearts: {
      revealText: 'Ke hapur një zbritje!',
      revealSubtitle: 'Përdor kodin DEMO20 për 20% zbritje',
    },
    scratch: {
      overlayText: 'Gërvisht këtu!',
      revealText: 'Fitove 15% zbritje!',
      revealSubtitle: 'Përdor kodin DEMO15 në checkout',
    },
    countdown: {
      endMessage: 'Oferta mbaroi. Faleminderit që luajte!',
    },
    memory: {
      revealSubtitle: '15% zbritje për porosinë tënde të radhës — na dërgo këtë kod në DM.',
    },
    campaign: {
      hero: {
        tagline: 'Rrotulla, zemrat, gërvishti, numërimi dhe kujtesa — provo çdo lojë.',
      },
    },
  },
  'demo-shop': {
    text: {
      title: 'Loja e kujtesës — fito një përfitim gardërobe',
      subtitle: 'Kthe dy karta njëherësh. Mundë kohën dhe gabimet.',
      ctaText: 'Na shkruaj në Instagram',
      resultTitle: 'Kujtesë perfekte!',
      resultSubtitle: 'Kodi yt i zbritjes është më poshtë.',
    },
    wheelPrizes: [
      { label: '10% zbritje triko', description: 'Vlen për triko dhe kardiganë' },
      { label: 'Scrunchie falas', description: 'Në dyqan ose me porosi online' },
      { label: 'Provo përsëri', description: 'Kthehu nesër' },
    ],
    tapHearts: {
      revealText: 'Ke kapur çmimin!',
      revealSubtitle: 'Kodi THREAD-HEARTS-8 — 8% zbritje aksesorë',
    },
    scratch: {
      overlayText: 'Gërvisht për përfitimin',
      revealText: '15% zbritje për porosinë tënde të parë',
      revealSubtitle: 'Përdor kodin THREAD-SCRATCH-15 në checkout',
    },
    countdown: {
      endMessage: 'Vjeshta është live — bli palltot me sasi të kufizuara.',
    },
    memory: {
      revealSubtitle: '12% zbritje për veshje me çmim të plotë — na dërgo këtë kod me foto të fitores.',
    },
    campaign: {
      featuredSectionTitle: 'Këtë javë në dyqan',
      gamesSectionTitle: 'Luaj dhe ç’kyç një përfitim',
      hero: {
        headline: 'Pjesë kapsulë për gardëroba të vërteta.',
        tagline: 'Fibre natyrale, çmime të ndershme, madhësi XS–XL.',
        ctaLabel: 'Shiko ardhjet e reja',
      },
      valueProposition: {
        headline: 'Blimi pakica të vogla që të mos qëndrojnë muaj me radhë në magazinë.',
        body: 'Thread & Fold është për ata që duan bazë cilësore dhe disa piese statement — pa markup të modës së shpejtë.',
      },
      howToOrder: {
        heading: 'Si të porosisësh',
        body: '1) Shfleto më poshtë ose në Instagram. 2) Na shkruaj me artikullin dhe madhësinë. 3) Konfirmojmë stokun dhe dërgojmë brenda 48 h (Tiranë) ose gjurmim në BE.',
        primaryCtaLabel: 'Mesazh në Instagram',
      },
      about: {
        whatWeSell: 'Këmisha liri, pallto leshi, xhinse dhe aksesorë me seri të vogël.',
        aboutUs: 'Dy miq e nisën Thread & Fold pas viteve në blerje me pakicë — vetëm atë që do të vishnim vetë.',
        physicalAddress: 'Rruga Ismail Qemali 8 (vizita studio të premte–shtunë me takim)',
      },
      featuredProducts: [
        {
          title: 'Triko merino — tërshëri',
          description: 'Mesatar, larje në lavatriçe në të ftohtë. Unisex.',
          ctaLabel: 'Rezervo me DM',
        },
        {
          title: 'Pantallona të gjera leshi',
          description: 'Bel i lartë, me veshje. Stok i kufizuar.',
          ctaLabel: 'Rezervo me DM',
        },
        {
          title: 'Mbulesë liri — bojë e errët',
          description: 'Shtresë e ajrosur për mbrëmje pranvere.',
          ctaLabel: 'Rezervo me DM',
        },
      ],
      testimonials: [
        {
          quote: 'Cilësia ndihet kur prek pëlhurën. Zbritja nga loja e kujtesës ishte surprizë e bukur!',
          author: 'Elira K.',
          role: 'Kliente',
        },
      ],
      trustBadges: [{ label: 'Fije nga BE' }, { label: 'Ndërrime brenda 14 ditësh' }, { label: 'Marrje në studio' }],
      faq: [
        {
          question: 'Si përdor kodin nga loja?',
          answer: 'Na shkruaj në Instagram me kodin nga ekrani i fitores brenda 7 ditëve.',
        },
        {
          question: 'Dërgoni jashtë Shqipërisë?',
          answer: 'Po — dërgojmë në adresat e BE-së me postë të gjurmuar. Çmimet varëojnë sipas peshës.',
        },
      ],
    },
  },
  'demo-bakery-luna': {
    text: {
      title: 'Përputh ëmbëlsirat — fito një dhuratë pastiçerie',
      subtitle: 'Gjej çdo çift para se të mbarojë koha. Gabimet kushtojnë!',
      ctaText: 'Porosit në WhatsApp',
      resultTitle: 'Fitore e freskët!',
      resultSubtitle: 'Trego këtë ekran ose kodin në marrje.',
    },
    wheelPrizes: [
      { label: 'Cortado falas', description: 'Me çdo kuti pastiçerie' },
      { label: '€1 zbritje viennoiserie', description: 'Vetëm të njëjtën ditë' },
      { label: 'Provo përsëri', description: 'Vizita tjetër' },
    ],
    tapHearts: {
      revealText: 'Shporta e mëngjesit u ç’kyç!',
      revealSubtitle: 'Kodi ROSE-HEARTS — kuki me gjalpë falas me bukë',
    },
    scratch: {
      overlayText: 'Gërvisht bukën',
      revealText: 'Fitove një përfitim fundjavë',
      revealSubtitle: 'Bli një merr dy kroasantë të shtunën — thuaj ROSE-SCRATCH në banak',
    },
    countdown: {
      endMessage: 'Porositë për bukën e fundjavës mbyllen të premten në 18:00!',
    },
    memory: {
      revealSubtitle: '8% zbritje për porosinë tënde të radhës së bukës — na dërgo këtë kod në WhatsApp para pagesës.',
    },
    campaign: {
      hero: {
        headline: 'Brumë i ngadaltë. Gjalpë i vërtetë. Marrje e njëjtës dite në Tiranë.',
        tagline: 'Bukë tharmi, viennoiserie dhe torta festash me porosi.',
        ctaLabel: 'Shiko menunë e javës',
      },
      valueProposition: {
        headline: 'Fermentojmë 24–36 orë dhe pjekim në seri të vogla.',
        body: 'Rose & Crumb është pasticeria ku shkruan kur do diçka të ngrohtë për mëngjes ose një tortë që vërtet shijon shtëpiake.',
      },
      howToOrder: {
        heading: 'Si të porosisësh',
        body: '1) WhatsApp ose DM me datën dhe artikujt. 2) Konfirmojmë orarin e marrjes. 3) Paguaj me link ose në marrje.',
        primaryCtaLabel: 'WhatsApp pasticerisë',
      },
      about: {
        whatWeSell: 'Bukë fshati, kroasantë me gjalpë, tartë sezonale, torta me porosi.',
        aboutUs: 'Hapur në 2019 — shefi ynë u traj në Lion; salla është familjare.',
        physicalAddress: 'Rruga e Kafeterive 4 (hyrja anësore, kërko llambën e bukës)',
      },
      featuredProducts: [
        {
          title: 'Bukë fshati (750 g)',
          description: 'Fermentim 24 h në të ftohtë, kore e errët.',
          ctaLabel: 'Rezervo për të shtunën',
        },
        {
          title: 'Kroasant me badem (kuti 4)',
          description: 'Pjekur në mëngjesin e marrjes.',
          ctaLabel: 'Rezervo',
        },
      ],
      testimonials: [
        {
          quote: 'Viennoiserie që rivalizon Parisin. Porositja në WhatsApp është e thjeshtë.',
          author: 'Dorina M.',
          role: 'Stammiste',
        },
      ],
      trustBadges: [{ label: 'Pjekur e njëjtën ditë' }, { label: 'Miell vendor kur është e mundur' }],
      faq: [
        {
          question: 'A mund ta ngrij bukën e tharmit?',
          answer: 'Po — pres së pari, pastaj deri në 2 muaj në ngrirje. Ngroh nga i ngrire në 180°C për 8 minuta.',
        },
      ],
    },
  },
  'demo-arcade-night': {
    text: {
      title: 'Loja e kujtesës — zbuloni përfitimin për bizhuteri',
      subtitle: 'Përputh çifte ikonash nga koleksionet. Fokusi fiton.',
      ctaText: 'Rezervo shikim privat',
      resultTitle: 'Memorie pa gabime',
      resultSubtitle: 'Kodi ekskluziv është më poshtë — trajtojeni si një diamant.',
    },
    wheelPrizes: [
      { label: 'Masë falas', description: 'Me çdo blerje unaze' },
      { label: '10% zbritje zinxhirësh', description: 'Koleksioni gold vermeil' },
      { label: 'Provo përsëri', description: 'Një ditë tjetër' },
    ],
    tapHearts: {
      revealText: 'Ke një përfitim për bizhuteri!',
      revealSubtitle: 'Kodi AURELIA-HEARTS — copë pastrimi dhe çantë në porosinë tënde të radhës',
    },
    scratch: {
      overlayText: 'Gërvisht për të zbuluar',
      revealText: 'Seancë stilimi private',
      revealSubtitle: 'Shpërbeni AURELIA-SCRATCH me DM — 30 min, vende në ditët e javës',
    },
    countdown: {
      endMessage: 'Takimet për trunk show janë të hapura — na shkruaj për rezervim.',
    },
    memory: {
      revealSubtitle: '15% zbritje për riparim ose rifacim bizhuterie të mirë — përfshi këtë kod në DM në Instagram.',
    },
    campaign: {
      hero: {
        headline: 'Piese të vendosura me dorë. Lukso i heshtur.',
        tagline: 'Unaza fejese, unaza për të grënduar dhe gurë unikë — me takim.',
      },
      valueProposition: {
        headline: 'Marrim gurë me dokumentacion që mund të besosh.',
        body: 'Aurelia & Co. punon me furnitorë të certifikuar; çdo pjesë mund të vlerësohet dhe të sigurohet përpara se të largohesh.',
      },
      howToOrder: {
        heading: 'Rezervo konsultën',
        body: '1) DM në Instagram me buxhetin. 2) Sugjerojmë gurë brenda buxhetit. 3) Depozita rezervon pjesën; saldo në dorëzim.',
        primaryCtaLabel: 'DM në Instagram',
      },
      about: {
        whatWeSell: 'Unaza fejese, unaza martese, zinxhirë ari dhe rifacime me porosi.',
        aboutUs: 'Themeluar nga një gemolog dhe një argjendar — një studio, pa markup franchise.',
        physicalAddress: 'Blloku — adresa e saktë kur konfirmohet takimi',
      },
      featuredProducts: [
        {
          title: 'Unazë shenjtërimi — ari 14k',
          description: 'E gravueshme, me porosi në 3 javë.',
          ctaLabel: 'Pyet për masën',
        },
        {
          title: 'Vathë diamanti laboratori (0.5 ct gjithsej)',
          description: 'Ngjyra F-G, pastërtia VS, bishta 18k.',
          ctaLabel: 'Kërko certifikatën',
        },
      ],
      trustBadges: [{ label: 'Gurë të certifikuar' }, { label: 'Transport i siguruar' }],
      faq: [
        {
          question: 'A rifasoni unaza të blera diku tjetër?',
          answer: 'Shpesh po — dërgo foto dhe hallmark-et me DM; japim çmim përpara vizitës.',
        },
      ],
    },
  },
  'luna-outfits': {
    text: {
      title: 'Rrotullo për një përfitim gardërobe',
      subtitle: 'Luna Outfits i shpërblen blerësit kureshtarë — një rrotullim në ditë.',
      ctaText: 'Na shkruaj në Instagram',
      resultTitle: 'Bukur — ja përfitimi yt!',
      resultSubtitle: 'Bëj foto ekranit dhe na shkruaj brenda 7 ditëve.',
    },
    wheelPrizes: [
      { label: '12% zbritje xhaketa', description: 'Pallto dhe xhaketa — vetëm çmim i plotë.' },
      { label: 'Rregullim falas në pëlhurëtar', description: 'Një fund ose mëngë me blerje.' },
      { label: 'Kupon 15 £ për aksesorë', description: 'Shall, rrip ose kapele.' },
      { label: 'Pa përfitim këtë herë', description: 'Kthehu pas periudhës së pritjes.' },
    ],
    tapHearts: {
      revealText: 'Sekuenca e zemrave Luna u ç’kyç!',
      revealSubtitle: 'Na dërgo LUNA-HEARTS me foto të ekranit',
    },
    scratch: {
      overlayText: 'Gërvisht për përfitimin',
      revealText: '18% zbritje për porosinë tënde të parë me çmim të plotë',
      revealSubtitle: 'Kodi LUNA-SCRATCH — online dhe studio',
    },
    countdown: {
      endMessage: 'Shitja e arkivit është live — madhësi të kufizuara.',
    },
    memory: {
      revealSubtitle: '14% zbritje kur na dërgon këtë kod me foto të fitores.',
    },
    campaign: {
      featuredSectionTitle: 'Në studio tani',
      gamesSectionTitle: 'Luaj në telefon',
      hero: {
        headline: 'Pëlhurëtar i qetë. Pëlhura e ndershme.',
        tagline: 'Pallto, triko dhe pantallona me seri të vogël — Luna Outfits prerë për veshje të përditshme.',
        ctaLabel: 'Shiko risitë',
      },
      valueProposition: {
        headline: 'Blejmë pëlhurë me metër, jo sipas kalendarit të trendeve.',
        body: 'Luna Outfits punon me fabrika në Portugali dhe Itali; çdo pjesë është menduar të zgjasë disa dimra.',
      },
      howToOrder: {
        heading: 'Si të blesh',
        body: '1) Na shkruaj me pjesën dhe madhësinë. 2) Konfirmojmë stokun nga rafti i studios. 3) Marrje në Shoreditch ose dërgesë me gjurmim në MB.',
        primaryCtaLabel: 'DM në Instagram',
      },
      about: {
        whatWeSell: 'Pallto leshi, triko merino, pantallona të prera, rripa lëkure.',
        aboutUs: 'Themeluar nga një prerës ish-Savile Row — modë e ngadaltë pa moralizim.',
        physicalAddress: 'Vizita studio të enjte–shtunë me takim',
      },
      featuredProducts: [
        {
          title: 'Pallto dyfytyrësh leshi — qymyr',
          description: 'Sup i ulët, mëngë raglan. EU 34–44.',
          ctaLabel: 'Rezervo',
        },
        {
          title: 'Triko rib merino — bardhë',
          description: 'Mesatar, i punuar plotësisht.',
          ctaLabel: 'Rezervo',
        },
      ],
      testimonials: [
        {
          quote: 'Palltot më përshtatet sikur më është bërë — përfitimi nga rrotulla më dha shtysën.',
          author: 'James L.',
          role: 'Klient',
        },
      ],
      trustBadges: [{ label: 'Dërgesë me gjurmim në MB' }, { label: 'Matje në studio' }],
      faq: [
        {
          question: 'Si e shpërblej kodin nga loja?',
          answer: 'Na shkruaj në Instagram brenda 7 ditëve me foto të ekranit të fitores.',
        },
      ],
    },
  },
  'astra-accessories': {
    text: {
      title: 'Gërvisht ose luaj për surprizën tënde',
      subtitle: 'Bizhuteri dhe aksesorë — një lojë falas për vizitor.',
      ctaText: 'Na shkruaj në DM',
      resultTitle: 'Faleminderit!',
      resultSubtitle: 'Oferta jote është më poshtë.',
    },
    wheelPrizes: [
      { label: 'Dërgesë falas', description: 'Dërgesë me gjurmim në porosinë tënde të radhës.' },
      { label: 'Dhuratë surprizë', description: 'Një falënderim i vogël nga ne në paketë.' },
      { label: '10% zbritje në porosi', description: 'Vlen për aksesorë dhe bizhuteri (detajet në DM).' },
      { label: '15% zbritje në porosi', description: 'Falënderim më i fortë — aksesorë dhe bizhuteri (detajet në DM).' },
      { label: 'Provo përsëri nesër', description: 'Sot pa çmim — kthehu pas afatit të lojës.' },
      { label: 'Jo në këtë raund', description: 'Pak fat — provo herën tjetër.' },
    ],
    scratch: {
      overlayText: 'Zbuloje mirësjelljen',
      revealText: 'Dritare për takim përparësie',
      revealSubtitle: 'Përmend kodin ASTRA-SCRATCH kur na shkruan',
    },
    tapHearts: {
      revealText: 'Sekuenca e zemrave Astra u plotësua',
      revealSubtitle: 'DM ASTRA-HEARTS — copë pastrimi falas',
    },
    countdown: {
      endMessage: 'Takimet për koleksionin e Shën Valentinit janë të hapura.',
    },
    memory: {
      revealSubtitle: '10% për punën e atelies — na dërgo foto të fitores me DM.',
    },
    campaign: {
      hero: {
        headline: 'Bizhuteri stainless steel & aksesorë',
        tagline: 'Detajet e vogla bëjnë diferencën',
        ctaLabel: 'Luaj, fito dhe na shkruaj',
      },
      valueProposition: {
        headline: 'Aksesorë modernë + lojëra interaktive për ndjekësit',
        body: 'Astra Accessories kombinon stilin me eksperiencën. Klientët luajnë, fitojnë oferta apo dhurata dhe porosisin direkt në DM.',
      },
      howToOrder: {
        heading: 'Një eksperiencë ndryshe blerjeje',
        body: '1) Luaj një nga lojërat 🎮 2) Fito ofertë ose surprizë 🎁 3) Na dërgo kodin e fituar në DM ose screenshot për të bërë porosinë.',
        primaryCtaLabel: 'Na shkruaj në DM',
      },
      about: {
        whatWeSell: 'Varëse, byzylykë, unaza, aksesorë fashion & dhurata.',
        aboutUs: 'Astra Accessories është krijuar për vajzat që duan stil modern dhe detaje unike.',
        physicalAddress: 'Online shop • Dërgesa në gjithë Shqipërinë',
        city: 'Tiranë',
        country: 'Shqipëri',
      },
      featuredProducts: [
        {
          title: 'Varëse minimaliste — gold plated ✨',
          description: 'Elegantë, të lehta dhe perfekte për çdo outfit.',
          ctaLabel: 'Porosit në DM',
        },
        {
          title: 'Byzylyk stainless steel — waterproof 💖',
          description: 'Nuk nxin dhe kombinohet lehtësisht me aksesorë të tjerë.',
          ctaLabel: 'Porosit në DM',
        },
      ],
      
      trustBadges: [
        { label: 'Dërgesa në gjithë Shqipërinë 🚚' },
        { label: 'Pagesë në dorë 💸' },
      ],
      
      faq: [
        {
          question: 'Si mund të porosis?',
          answer:
            'Luaj, fito ofertën tënde dhe na dërgo kodin në DM për të bërë porosinë.',
        },
        {
          question: 'A mund të fitoj zbritje ose dhurata?',
          answer:
            'Po 🎁 Çdo ofertë dhe surprizë vendoset nga Astra Accessories.',
        },
      ],
    },
  },
  'urban-glow': {
    text: {
      title: 'Kap capsule-at e glow-it',
      subtitle:
        'Prek çdo capsule — grim dhe kujdes për lëkurën nga Urban Glow, pa propagandë për mbushës të kotë në formulë.',
      ctaText: 'Ndërto rutinën',
      resultTitle: 'Fitore për lëkurën!',
      resultSubtitle: 'Përfitimi yt është gati — mund ta përdorësh tani.',
    },
    wheelPrizes: [
      { label: 'Serum peptide në madhësi udhëtimi', description: 'Sa kohë ka stok.' },
      { label: '20% zbritje për tre SPF', description: 'Paketë e plotë rutine.' },
      { label: 'Thirrje konsultë lëkure falas', description: '15 minuta me estetisten tonë.' },
      { label: 'Provo përsëri më vonë', description: 'Na vizito pasi të kalojë periudha e pritjes.' },
    ],
    tapHearts: {
      revealText: 'Mostër deluxe krem barrierë',
      revealSubtitle: 'DM URBAN-GLOW-HEARTS dhe adresa e dërgesës',
    },
    scratch: {
      overlayText: 'Gërvisht për të zbuluar përfitimin',
      revealText: '25% zbritje për pastruesin e mikrobiomit',
      revealSubtitle: 'Kodi UG-SCRATCH-25 — një përdorim për familje',
    },
    countdown: {
      endMessage: 'Risia e barrierës për pranverën niset së pari për anëtarët.',
    },
    memory: {
      revealSubtitle: '12% zbritje për shportën — dërgo foto në DM brenda 5 ditëve.',
    },
    campaign: {
      featuredSectionTitle: 'Të preferuarat nga studioja',
      gamesSectionTitle: 'Provo një përfitim',
      hero: {
        headline: 'Grim me rigorozitet laboratori.',
        tagline:
          'Baza që vë lëkurën së pari, pigmentë që qëndrojnë dhe SPF që do të duash të vesh çdo ditë.',
        ctaLabel: 'Ndërto rutinën time',
      },
      valueProposition: {
        headline: 'Çdo formulë testohet në persona me lëkurë të ndjeshme.',
        body: 'Urban Glow publikon INCI të plotë dhe përqindjet e aktivëve — pa fshehje aromash, pa vaj mineral si mbushës.',
      },
      howToOrder: {
        heading: 'Dërgojmë nga Los Anxhelesi',
        body: '1) Bli online ose na shkruaj në DM për ndihmë me nuancën. 2) Për produktet ndaj nxehtësisë, përdorim paketim të izoluar. 3) Abonohu dhe kurse 12% në ripërdorimet.',
        primaryCtaLabel: 'Dyqani në Instagram',
      },
      about: {
        whatWeSell: 'Grim i pastër, krem barrierë, serum me niacinamide, SPF mineral.',
        aboutUs:
          'Themeluar nga dy kimiste kozmetike pas një dekade në kërkim dhe zhvillim — Urban Glow shet vetëm drejtpërdrejt te klienti.',
        physicalAddress: 'Marrje në studio të premte pasdite',
      },
      featuredProducts: [
        {
          title: 'Krem barrierë rikuperimi — 50 ml',
          description: 'Ceramide NP dhe kolesteroli në raport 3:1:1.',
          ctaLabel: 'Shto përmes DM',
        },
        {
          title: 'SPF mineral 50 — nuancë e hollë',
          description: 'Vetëm zink; formulë e përshtatshme për riffet korale.',
          ctaLabel: 'Shto përmes DM',
        },
      ],
      testimonials: [
        {
          quote: 'Më në fund një SPF që nuk më djeg sytë — dhe nuanca duket lëkurë e vërtetë.',
          author: 'Ingrid M.',
          role: 'Abonente',
        },
      ],
      trustBadges: [{ label: 'Në përputhje me BE-në' }, { label: 'Dërgesë e ftohtë në verë' }],
      faq: [
        {
          question: 'A janë produktet të sigurta në shtatzëni?',
          answer: 'Kontrollo kundërindikacionet për çdo etiketë ose na shkruaj estetistes me tremujorin tënd.',
        },
      ],
    },
  },
};
