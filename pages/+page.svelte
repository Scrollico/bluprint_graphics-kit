<script lang="ts">
  import { onMount } from 'svelte';
  import { Block } from '@reuters-graphics/graphics-components';
  import ScrollytellingEngine from '$lib/scrollytelling/ScrollytellingEngine.svelte';
  import MapboxMap from '$lib/components/charts/MapboxMap.svelte';
  import YearlyTrendChart from '$lib/components/charts/YearlyTrendChart.svelte';
  import WeeklyDistributionChart from '$lib/components/charts/WeeklyDistributionChart.svelte';
  import MarmarayLineChart from '$lib/components/charts/MarmarayLineChart.svelte';
  import MetroMonthlyChart from '$lib/components/charts/MetroMonthlyChart.svelte';
  import InteractiveWordCloud from '$lib/components/charts/InteractiveWordCloud.svelte';
  import EuropeanSuicideChart from '$lib/components/charts/EuropeanSuicideChart.svelte';
  import DurkheimTheoryChart from '$lib/components/charts/DurkheimTheoryChart.svelte';
  import GlobalSolutionsSwarm from '$lib/components/charts/GlobalSolutionsSwarm.svelte';
  import SeamlessBubbleTransition from '$lib/components/charts/SeamlessBubbleTransition.svelte';
  import {
    loadMarmarayData,
    loadMetroData,
    loadGlobalSolutionsData,
  } from '$lib/utils/csvParser';
  import {
    SplitPanel,
    FullscreenVisual,
    StatisticCallout,
    PullQuote,
    SectionTitle,
    FullWidthBody,
  } from '$lib/components/layouts';

  // Story metadata
  const storyMeta: any = {
    title: "Marmaray'da Son 5 Yılda 29 İntihar Vakası",
    subtitle:
      "İstanbul'un iki yakasını birbirine bağlayan Marmaray hattında yaşanan trajik olayların analizi",
    authors: ['ALİ SAFA KORKUT'],
    publishDate: '15 Eylül 2025',
    section: 'Araştırma',
    sectionUrl: '/arastirma',
  };

  // Story steps from the markdown content
  const storySteps: any[] = [
    {
      id: 'step-1',
      type: 'intro',
      headline: "Marmaray'da Son 5 Yılda 29 İntihar Vakası",
      text: 'Editör Notu: Bu makale intihar konusunu ele almakta ve yaşamlarına son vermiş kişilerle ilgili ayrıntılar içermektedir. Eğer intihar düşünceleri yaşıyorsanız veya tanıdığınız birinin bu durumda olabileceğinden endişe ediyorsanız, yardım kaynakları mevcuttur.',
      visual: 'map-overview',
    },
    {
      id: 'step-2-1',
      type: 'text',
      headline: 'MARMARAY',
      text: "2021'den bu yana Marmaray hattında 29 intihar ya da intihar girişimi yaşandı. Bunların 20'si ölümle sonuçlanırken, vakalar belirli duraklarda yoğunlaştı.",
      visual: 'marmaray-line',
    },
    {
      id: 'step-2-2',
      type: 'text',
      text: "İstanbul'un iki yakasını birbirine bağlayan Marmaray hattı, her gün milyonlarca yolcuyu taşıyor. Ancak aynı hat, son beş yılda başka bir yolculuğun da sessiz bir tanığı oldu: Ölüm yolculuklarının.",
      visual: 'marmaray-line',
    },
    {
      id: 'step-3',
      type: 'text',
      text: 'Zira 2021 ile 2025 yılları arasında Marmaray istasyonlarında, kayıtlara geçen en az 29 intihar ya da intihar girişimi yaşandı. Öyle ki bazı istasyonlar adeta bu ölümlerin merkezine dönüştü. <span style="display:inline-block; background:#183153; color:#fff; padding:0.12em 0.45em; border-radius:4px; font-weight:600; margin-right:0.2em;">Yenikapı</span>, <span style="display:inline-block; background:#183153; color:#fff; padding:0.12em 0.45em; border-radius:4px; font-weight:600; margin-right:0.2em;">Ayrılık Çeşmesi</span> ve <span style="display:inline-block; background:#183153; color:#fff; padding:0.12em 0.45em; border-radius:4px; font-weight:600; margin-right:0.2em;">Bostancı</span>, en fazla ölümün yaşandığı duraklar olurken, vakalar en çok haftanın başında ve sabah saatlerinde meydana geldi. Ancak tüm bunlara rağmen kamuoyunun bu vakalardan haberdar olması ise çoğu zaman mümkün olmadı. Çünkü Marmaray yönetimi, bu olayları ya yalnızca <span style="display:inline-block; background:#d32f2f; color:#fff; padding:0.15em 0.5em; border-radius:4px; font-weight:600;">üzücü bir olay</span> diye duyurdu ya da hiç duyurmadı bile.',
      visual: 'station-heatmap',
    },
    {
      id: 'step-4-1',
      type: 'video',
      headline: 'Her şey bir anda oldu',
      text: `Her şey bir anda oldu. Tarih, 30 Ekim 2021. Soğuk bir sonbahar akşamı, saat 18.18.\nMarmaray, her zamanki Halkalı-Gebze seferini yapmak üzere raylarda ilerliyordu. Ancak o gün her zamanki rutinini yapan sadece o değildi. Bir yurttaş da yorucu bir günün ardından iş çıkış saatinde, evine gitmek üzere Marmaray Bostancı istasyonuna doğru yürüyordu.`,
      visual: 'video',
      align: 'left',
      videoSrc: '/videos/step-1.mp4',
    },
    {
      id: 'step-4-2',
      type: 'video',
      text: `Marmaray treni Suadiye istasyonundan ayrıldığı sırada o yurttaş da Bostancı istasyonundaki turnikelere İstanbulkartı’nı okutup perona doğru ilerlemeye başladı. Yaklaşık bir dakikalık bekleyişin ardından trenin ışıkları göründü. Hızla yaklaşan treni gören yurttaş, sakin adımlarla sarı çizgiye doğru ilermeye başladı.`,
      visual: 'video',
      align: 'center',
      videoSrc: '/videos/step-2.mp4',
    },
    {
      id: 'step-4-3',
      type: 'video',
      text: `Sonrasında her şey bir anda oldu.\n\nTren tam yavaşlamaya başlayacaktı ki, peronun en ucunda, trenle peronun kesiştiği noktada bekleyen yurttaş, trenin hız kaybetmesine fırsat vermeden attı kendini raylara doğru. Önce trene çarptı, ardından da çarpmanın etkisiyle ileri savrularak trenin altında kaldı.`,
      visual: 'video',
      align: 'right',
      videoSrc: '/videos/step-3.mp4',
    },
    {
      id: 'step-5-1',
      type: 'chart',
      headline: 'İntihar vakaları katlanarak artıyor',
      text: "Açık kaynaklardan edindiğimiz verilere göre 2021'de yalnızca bu iki vaka yaşandı. Ancak sonraki yıllarda hem intihar girişimi hem de ölü sayısı giderek arttı.",
      visual: 'yearly-trend',
    },
    {
      id: 'step-7-1',
      type: 'chart',

      text: "2023'te de intihar girişimi sayısı 2022'ye kıyasla iki kattan fazla artarak yediye çıktı. Bu girişimlerin dördü başarıya(!) ulaştı ve intihara kalkışanlar yaşamını yitirdi.",
      visual: 'yearly-analysis',
    },
    {
      id: 'step-9-1',
      type: 'chart',
      headline: 'İntihar girişimleri hafta sonuna doğru arttı',
      text: '2021 - 2025 tarihleri arasında intihar vakalarının en fazla yaşandığı gün ise <span style="display:inline-block; background:#d32f2f; color:#fff; padding:0.15em 0.5em; border-radius:4px; font-weight:600;">cumartesi</span> (9).',
      visual: 'weekly-distribution',
    },
    {
      id: 'step-9-2',
      type: 'text',
      headline: 'Marmaray Hattı',
      text: 'Marmaray hattı boyunca yaşanan intihar vakalarının lokasyonları',
      visual: 'marmaray-line',
    },
    {
      id: 'step-10-1',
      type: 'text',
      headline: 'STEP 10.1',
      text: "30 Mart'ta Ayrılık Çeşmesi istasyonunda yaşanan vakada intihara kalkışan kişinin akıbeti bilinmiyor.",
      visual: 'station-focus',
    },
    {
      id: 'step-10-2',
      type: 'text',
      headline: 'STEP 10.2',
      text: "23 Haziran'da Ataköy istasyonunda yaşanan vaka ölümle sonuçlandı.",
      visual: 'station-focus',
    },
    {
      id: 'step-10-3',
      type: 'text',
      headline: 'STEP 10.3',
      text: "9 Ağustos'ta ise Güzelyalı ve Darıca duraklarında benzer vakalar meydana geldi.",
      visual: 'station-focus',
    },
    {
      id: 'step-11-1',
      type: 'body',
      headline: "2024'te neredeyse her ay bir intihar vakası yaşandı",
      text: 'İntihar vakalarının aylara göre dağılımındaysa 2024 yılı öne çıktı.\n\nZira 2024\'te, özellikle yılın ilk beş ayında düzenli olarak her ay en az bir intihar vakası yaşandı. Yıl genelinde <span style="display:inline-block; background:#d32f2f; color:#fff; padding:0.15em 0.5em; border-radius:4px; font-weight:600;">12 ayın dokuzu</span> intihar girişimlerine sahne olurken; sadece Haziran, Temmuz ve Eylül ayları herhangi bir intihar vakasının yaşanmadığı aylar oldu.',
      visual: 'monthly-analysis',
    },
    {
      id: 'step-12-1',
      type: 'text',
      headline: 'STEP 12.1',
      text: "Öteki tarafın Yenikapı'sı: Dört yılda sekiz intihar vakası yaşandı",
      visual: 'station-heatmap',
    },
    {
      id: 'step-12-2',
      type: 'text',
      headline: 'STEP 12.2',
      text: 'Peki bu vakalar en çok hangi istasyonlarda yoğunlaştı?',
      visual: 'station-heatmap',
    },
    {
      id: 'step-12-3',
      type: 'text',
      headline: 'STEP 12.3',
      text: 'Özellikle Yenikapı, Bostancı ve Ayrılık Çeşmesi, son beş yılda en çok intihara sahne olan istasyonlar konumunda. Öyle ki <span style="display:inline-block; background:#d32f2f; color:#fff; padding:0.15em 0.5em; border-radius:4px; font-weight:600;">29 vakanın 17\'si, yani yüzde 62\'si</span> bu üç istasyonda yaşandı.',
      visual: 'station-heatmap',
    },
    {
      id: 'step-13-1',
      type: 'text',
      headline: 'STEP 13.1',
      text: "Bu intihar vakalarına dair resmi açıklamalar ise sınırlı bir iletişim pratiğine işaret ediyor. Zira Ulaştırma ve Altyapı Bakanlığı'na bağlı Marmaray'ın resmi X (Twitter) hesabı, bu vakaların 23'ünü kamuoyuna duyururken, diğer yedi vakadan dördünü önce duyurup sonra sildi. Marmaray, iki intihar vakasını ise hiç duyurmadı.",
      visual: 'communication-timeline',
    },
    {
      id: 'step-14-1',
      type: 'chart',
      headline: 'STEP 14.1',
      text: "Metro istasyonlarında da durum farklı değil: 2024'te zirve yaptı",
      visual: 'metro-monthly',
    },
    {
      id: 'step-18.1',
      type: 'chart',
      headline: 'DÜNYA ÖRNEKLERİ: METRO GÜVENLİĞİNDE BAŞARILI UYGULAMALAR',
      text: 'Dünyanın farklı metropollerinde tren hatlarında yaşanan intihar vakalarıyla ilgili net bir veri yok. Ancak çözüm önerilerine ulaşmak mümkün. Tokyo, Londra, Seul ve Paris gibi büyük metropoller, farklı yaklaşımlarla bu soruna çözüm üretmeye çalışıyor.',
      visual: 'global-solutions',
    },
    {
      id: 'step-18.2',
      type: 'text',
      headline: 'TOKYO: TEKNOLOJİ VE PSİKOLOJİ BİRLEŞİMİ',
      text: 'Japonya, dünyada en yüksek intihar oranlarına sahip ülkelerden biri. Tokyo metrosu, bu sorunla mücadelede en kapsamlı yaklaşımı sergiliyor.',
      visual: 'global-solutions',
    },
    {
      id: 'step-18.3',
      type: 'text',
      headline: 'LONDRA: FİZİKSEL VE EĞİTİMSEL ÇÖZÜMLER',
      text: 'Londra metrosu, hem fiziksel hem de eğitimsel yaklaşımlarla soruna çözüm üretiyor.',
      visual: 'global-solutions',
    },
    {
      id: 'step-18.4',
      type: 'text',
      headline: 'SEUL: TAM KAPALI SİSTEM VE VERİ TEMELLİ YAKLAŞIM',
      text: 'Güney Kore, intihar önleme konusunda en sistematik yaklaşımı sergiliyor.',
      visual: 'global-solutions',
    },
    {
      id: 'step-18.5',
      type: 'text',
      headline: 'PARİS: OTOMATİK SİSTEMLER VE SOSYAL DESTEK',
      text: 'Paris metrosu, özellikle otomatik sürücüsüz hatlarda uzun süredir platform kapıları kullanıyor.',
      visual: 'global-solutions',
    },
    {
      id: 'step-19',
      type: 'chart',
      headline: 'AB ülkeleri: En fazla intihar Batı Avrupa ülkelerinde',
      text: "Avrupa resmi istatistik kurumu Eurostat'ın 2006–2023 verileri, Avrupa Birliği (AB) üye ülkelerindeki demiryolu hatlarında yaşanan intihar sayısının 2010'da artmaya başlayıp 2012'de zirveyi gördüğünü ve sonraki yıllarda kademeli olarak azaldığını gösteriyor.",
      visual: 'european-data',
    },
    {
      id: 'step-20',
      type: 'chart',
      headline: 'DURKHEIM TEORİSİ: İNTİHAR TİPLERİ',
      text: 'Fransız sosyolog Émile Durkheim\'ın 1897\'de yayımladığı "İntihar" çalışması, intihar olgusunu sosyolojik bir perspektifle ele alan ilk kapsamlı araştırmadır. Durkheim, intiharı bireysel bir psikolojik olay olarak değil, toplumsal faktörlerin etkilediği sosyal bir olgu olarak inceler.',
      visual: 'durkheim-theory',
    },
    {
      id: 'step-21',
      type: 'text',
      headline: 'EGOİSTİK İNTİHAR: ALMANYA VE FRANSA ÖRNEĞİ',
      text: "Almanya ve Fransa'daki yüksek intihar oranları, Durkheim'ın egoistik intihar teorisini doğrular. Bu ülkelerde sosyal izolasyon, ekonomik baskı ve kültürel değişim etkili oluyor. Almanya'da 2006-2023 arasında 13.017 intihar vakası, Fransa'da 5.339 vaka bu teorinin güçlü kanıtlarıdır.",
      visual: 'durkheim-theory',
    },
    {
      id: 'step-22',
      type: 'text',
      headline: "ANOMİK İNTİHAR: İTALYA VE İSPANYA'DA NORM ÇATIŞMASI",
      text: "İtalya ve İspanya'daki intihar desenleri, anomik intihar teorisini destekler. Ekonomik krizler, sosyal değişim ve kurumsal güvensizlik bu tipe neden olur. İtalya'da 2.441, İspanya'da benzer oranlarda intihar vakası, toplumsal düzenin bozulduğu dönemlerde artış gösterir.",
      visual: 'durkheim-theory',
    },
    {
      id: 'step-23',
      type: 'text',
      headline: "ALTRUİSTİK İNTİHAR: DOĞU AVRUPA'DA KOLEKTİF DEĞERLER",
      text: 'Doğu Avrupa ülkelerindeki intihar desenleri, altruistik intihar teorisini yansıtır. Güçlü grup bağları, kolektif sorumluluk ve geleneksel değerler bu tipe neden olur. Polonya, Macaristan, Romanya gibi ülkelerde düşük intihar oranları, güçlü sosyal bağların koruyucu etkisini gösterir.',
      visual: 'durkheim-theory',
    },
    {
      id: 'step-24',
      type: 'text',
      headline: 'FATALİSTİK İNTİHAR: MARMARAY ÖRNEĞİ',
      text: "Marmaray'daki intihar vakaları, fatalistik intihar teorisinin en net örneğidir. Aşırı kontrol, umutsuzluk ve sosyal baskı bu tipe neden olur. Marmaray'daki intihar vakalarının özellikleri: genç yaş grubunda yoğunlaşma, eğitimli bireylerde daha sık görülme, sosyal medyada yaygınlaşma.",
      visual: 'durkheim-theory',
    },
    {
      id: 'step-25',
      type: 'text',
      headline: 'DURKHEIM TEORİSİ VE MARMARAY BAĞLANTISI',
      text: "Marmaray intiharları, Durkheim'ın teorisinin güncel bir uygulamasıdır. Fatalistik, anomik ve egoistik özellikler bir arada görülür. Marmaray örneği, modern kent yaşamında farklı intihar tiplerinin bir arada görülebileceğini ve bunların karmaşık sosyal dinamiklerle ilişkili olduğunu gösterir.",
      visual: 'durkheim-theory',
    },
    {
      id: 'step-26',
      type: 'text',
      headline:
        'Uzman Görüşü: "Her intihar davranışı öncelikle bir yardım çığlığıdır"',
      text: 'Türkiye Psikiyatri Derneği Krize Müdahale ve İntiharı Önleme Çalışma Birimi Üyesi Doç. Dr. Yunus Hacımusalar\'a göre, intihar düşüncesi olan birinin yönteme erişim kolaylığı, riski ciddi şekilde artırıyor. Tren ve metro gibi alanların intihar aracı olarak kullanılmasının nedenlerinden birinin de bu olduğunu söyleyen Hacımusalar, "Bir yönteme ulaşmak ne kadar kolaysa bu risk de o kadar artar. Ayrıca kişinin intihar yöntemiyle ilgili ayrıntılı planlar yapması ve yoğun düşünceler, kişinin hayatta kalma ihtimalini en aza indiren yöntemi seçmesine neden olabilir" dedi.\n\nHacımusalar\'a göre intihar, her şeyden önce bir yardım çığlığı olarak değerlendirilmeli: "İntihar; kişinin içinde bulunduğu ruhsal, sosyal, çevresel ve/veya ekonomik gibi stres olaylarıyla baş edemediğini ve yardıma ihtiyacı olduğunu gösteren bir halk sağlığı sorunudur. Bu eylemlere özenilebilecek anlamlar yüklemek, kişiye özel bir statü kazandırmak veya sorunun çözüm yollarından biri olarak sunmak son derece sakıncalıdır. Bu, intihar davranışının bulaşıcılığını artırabilir."\n\nHacımusalar, Marmaray yönetiminin yaşanan olayları "intihar" yerine "üzücü bir olay" şeklinde duyurmasını da değerlendirdi. İntihar haberlerinin hazırlanış biçiminin büyük önem taşıdığını söyleyen Hacımusalar, "İntihar haberleri, kaybedilen kişinin yakınları ile kendine zarar verme düşüncesi olan kişiler ve toplumda farklı etkiler yaratır. Bu nedenle haberlerin sunumunda insani, etik ve psikiyatrik ilkeler gözetilmeli. Haberin okunma oranını artırmaya yönelik unsurlar, intihar gibi özel konularda ciddi ve geri dönüşü olmayan zararlar doğurabilir" dedi.',
    },
    {
      id: 'step-27',
      type: 'text',
      headline: 'Sonuç',
      text: 'Marmaray hattında yaşanan intihar vakaları, sadece bir ulaşım sorunu değil, aynı zamanda toplumsal bir sağlık sorunudur. Bu vakaların önlenmesi için hem fiziksel hem de psikososyal önlemlerin birlikte uygulanması gerekiyor. Dünyadan örnekler gösteriyor ki, bu sorunla mücadelede başarılı olmak mümkün. Ancak bunun için kararlılık, kaynak ve toplumsal farkındalık gerekiyor.',
    },
  ];

  // Data for charts (loaded from CSV files)
  let marmarayData: any = {};
  let metroData: any = {};
  let dataLoaded = false;

  // Reactive statement to force re-rendering when data changes
  $: if (dataLoaded && marmarayData.europeAverages) {
    console.log('European data available:', marmarayData.europeAverages);
  }

  // Scrollytelling state
  let currentStepIndex = 0;
  let currentStep: any = null;

  // Video step fade transition state
  let videoStepVisible = false;
  let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Animated line state for step 5-1
  let lineProgress = 0;
  // Animated bar state for step 9-1
  let weeklyProgress = 0;
  // Metro monthly chart progress for step 14-1
  let metroMonthlyProgress = 0;
  // European data chart progress for step 19
  let europeanProgress = 0;
  // Global solutions data
  let globalSolutionsData: any[] = [];
  // State persistence for step 19 - once animated, keep the state
  let europeanChartAnimated = false;
  let europeanChartFullyLoaded = false;
  // Durkheim theory chart progress for step 20
  let durkheimProgress = 0;
  // Global solutions swarm progress for steps 18.1–18.5
  let globalSolutionsProgress = 0;
  // Align behavior with weekly bars: start partially visible, animate smoothly
  function metroProgressShifted(p: number) {
    const start = 0.15;
    const k = 1 - start;
    const val = start + k * Math.max(0, Math.min(1, p || 0));
    return Math.max(0, Math.min(1, val));
  }
  // Map weekly progress to start a bit earlier without increasing speed
  function barProgressShifted(p: number) {
    const start = 0.15; // 15% visible at step entry
    const k = 1 - start; // keep final at 100% without speeding up
    const val = start + k * Math.max(0, Math.min(1, p || 0));
    return Math.max(0, Math.min(1, val));
  }

  onMount(async () => {
    // Load CSV data for charts
    try {
      console.log('Starting to load data...');
      const [marmaray, metro, globalSolutions] = await Promise.all([
        loadMarmarayData(),
        loadMetroData(),
        loadGlobalSolutionsData(),
      ]);

      marmarayData = marmaray;
      metroData = metro;
      globalSolutionsData = globalSolutions;
      dataLoaded = true;

      console.log('Loaded Marmaray data:', marmaray);
      console.log('Loaded Metro data:', metro);
      console.log('European data:', marmaray.europeAverages);
      console.log('Global solutions data:', globalSolutions);
      console.log('European data length:', marmaray.europeAverages?.length);
      console.log('Sample European data:', marmaray.europeAverages?.[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  });

  let metroEnterTimer: ReturnType<typeof setTimeout> | null = null;

  function handleStepEnter(event: CustomEvent) {
    currentStepIndex = event.detail.index;
    currentStep = event.detail.step;

    // Handle transition from step 18.5 to step 19
    if (currentStep?.id === 'step-19') {
      // Trigger seamless bubble transition
      import('$lib/stores/chartTransition').then(({ startTransition }) => {
        console.log('🎬 Triggering seamless transition to step-19');
        startTransition('step-18.5', 'step-19', []);
      });
    }

    // Handle video step fade transitions
    if (currentStep?.type === 'video') {
      videoStepVisible = false; // Start hidden
      if (fadeTimeout) clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => {
        videoStepVisible = true; // Fade in after brief delay
      }, 200);
    } else {
      videoStepVisible = false; // Hide for non-video steps
      if (fadeTimeout) clearTimeout(fadeTimeout);
    }

    // Reset animated states for other steps
    if (currentStep?.id !== 'step-5-1') lineProgress = 0;
    if (currentStep?.id !== 'step-9-1') weeklyProgress = 0;
    if (currentStep?.id !== 'step-14-1') {
      if (metroEnterTimer) clearTimeout(metroEnterTimer);
      metroMonthlyProgress = 0;
    } else {
      // Kick-start progress so bars are visible even if progress event is delayed
      metroMonthlyProgress = 0.001;
      if (metroEnterTimer) clearTimeout(metroEnterTimer);
      metroEnterTimer = setTimeout(() => {
        metroMonthlyProgress = 1;
      }, 150);
    }
    // Don't reset europeanProgress for step-19 to maintain state
    if (currentStep?.id !== 'step-19' && currentStep?.id !== 'step-20') {
      // Only reset if we haven't fully loaded the chart yet
      if (!europeanChartFullyLoaded) {
        europeanProgress = 0;
      }
    }
    if (
      ![
        'step-20',
        'step-21',
        'step-22',
        'step-23',
        'step-24',
        'step-25',
      ].includes(currentStep?.id)
    )
      durkheimProgress = 0;

    // Reset global solutions progress when leaving global solutions steps
    if (!isGlobalSolutionsStep(currentStep?.id)) globalSolutionsProgress = 0;
  }

  function handleStepProgress(event: CustomEvent) {
    const stepId = event.detail?.step?.id;

    // Animate red line for step 5-1 based on scroll progress
    if (stepId === 'step-5-1') {
      lineProgress = event.detail.progress;
    }
    // Animate weekly bars for step 9-1 based on scroll progress
    if (stepId === 'step-9-1') {
      weeklyProgress = event.detail.progress;
    }
    // Animate metro monthly bars for step 14-1 based on scroll progress
    if (stepId === 'step-14-1') {
      const maybe = event.detail?.progress;
      const progress = maybe == null ? 1 : Math.min(1, Math.max(0, maybe));
      metroMonthlyProgress = Math.max(metroMonthlyProgress, progress);
    }
    // Animate European data chart for step 19
    if (stepId === 'step-19') {
      const progress = event.detail.progress || 0;
      europeanProgress = progress;
      // Mark as animated once we have some progress
      if (progress > 0.1) {
        europeanChartAnimated = true;
      }
      // Mark as fully loaded when progress reaches 95%
      if (progress >= 0.95) {
        europeanChartFullyLoaded = true;
      }
    }
    // Animate global solutions swarm for steps 18.1-18.5
    if (isGlobalSolutionsStep(stepId)) {
      globalSolutionsProgress = event.detail.progress || 0;
    }
    // Animate Durkheim theory chart for steps 20-25
    if (
      [
        'step-20',
        'step-21',
        'step-22',
        'step-23',
        'step-24',
        'step-25',
      ].includes(stepId)
    ) {
      durkheimProgress = event.detail.progress || 0;
    }
  }

  function computeMapTarget(
    step: any
  ):
    | 'istanbul'
    | 'turkey'
    | 'ayrilikcesmesi'
    | 'guzelyali-darica'
    | 'yenikapi'
    | 'atakoy'
    | 'guzelyali'
    | 'darica'
    | 'nyc'
    | 'texas'
    | 'test-from'
    | 'test-to' {
    if (!step) return 'istanbul';

    switch (step.visual) {
      case 'map-overview':
        return 'turkey';
      case 'marmaray-line':
        return 'istanbul';
      case 'station-heatmap':
        return 'istanbul';
      case 'communication-timeline':
        return 'istanbul';
      case 'bostanci-station':
        return 'istanbul';
      case 'station-focus':
        if (step.id === 'step-10-1') {
          return 'ayrilikcesmesi';
        }
        if (step.id === 'step-10-3') {
          return 'guzelyali-darica';
        }
        return 'yenikapi';
      default:
        return 'istanbul';
    }
  }

  let mapTarget = computeMapTarget(null);

  $: mapTarget = computeMapTarget(currentStep);

  function shouldShowChart(): boolean {
    return (
      currentStep?.visual?.includes('trend') ||
      currentStep?.visual?.includes('analysis') ||
      currentStep?.visual?.includes('distribution')
    );
  }

  function isStep(id: string): boolean {
    return currentStep?.id === id;
  }

  // Guard utility: template-safe check for video steps
  function isVideoStep(s: any): boolean {
    return s && typeof s === 'object' && s.type === 'video';
  }
  // Workaround typing on Block requiring children; render dynamically
  const BlockAny: any = Block;

  const globalSolutionsIdPattern = /^step-18[.\-][1-5]$/;

  function isGlobalSolutionsStep(id: string | undefined | null): boolean {
    return typeof id === 'string' && globalSolutionsIdPattern.test(id);
  }
</script>

<svelte:head>
  <title>{storyMeta.title}</title>
  <meta name="description" content={storyMeta.subtitle} />
</svelte:head>

<div class="story-container" class:step3={currentStep?.id === 'step-3'}>
  <!-- Main Scrollytelling Container -->
  <ScrollytellingEngine
    steps={storySteps}
    debug={false}
    offset={0.6}
    threshold={0.25}
    on:stepenter={handleStepEnter}
    on:stepprogress={handleStepProgress}
  >
    <!-- Text Steps (Right Side) -->
    <div
      slot="step"
      let:step
      let:active
      class="step-container"
      class:fullwidth-step={step.id === 'step-3' ||
        step.id === 'step-11-1' ||
        step.id === 'step-26' ||
        step.id === 'step-27'}
    >
      {#if step.id === 'step-3' || step.id === 'step-11-1' || step.id === 'step-26' || step.id === 'step-27'}
        <FullWidthBody
          content={step.text}
          headline={(
            step.id === 'step-11-1' ||
            step.id === 'step-26' ||
            step.id === 'step-27'
          ) ?
            step.headline
          : null}
          maxWidth={760}
          align="center"
          topPadding="8rem"
          bottomPadding="8rem"
        ></FullWidthBody>
      {:else if step.id === 'step-14-1'}
        <!-- Normal text content for step 14-1 -->
        <div class="step-content">
          <h2 class="step-headline">{step.headline}</h2>
          <p class="step-text">{step.text}</p>
        </div>
      {:else if isVideoStep(step)}
        <div class="video-caption" class:fade-in={videoStepVisible}>
          {#if step.headline}
            <h3 class="video-title">{step.headline}</h3>
          {/if}
          {#if step.text}
            <p class="video-description">{@html step.text}</p>
          {/if}
        </div>
      {:else}
        <div class="step-content" class:active>
          {#if step.headline}
            <h2>{step.headline}</h2>
          {/if}
          {#if step.text}
            <div class="step-text">{@html step.text}</div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Visual/Graphic Area (Left Side) -->
    <div
      slot="graphic"
      class="graphic-container"
      class:align-left={currentStep?.visual === 'station-heatmap'}
      class:hidden-graphic={currentStep?.id === 'step-3' ||
        currentStep?.id === 'step-11-1'}
    >
      {#if currentStep}
        {#if currentStep.type === 'video'}
          <div class="video-frame {currentStep.align || 'center'}">
            <video
              autoplay
              muted
              playsinline
              loop
              preload="metadata"
              on:error={(e) => console.error('Video error:', e)}
              on:loadstart={() =>
                console.log('Video loading:', currentStep.videoSrc)}
              on:canplay={() =>
                console.log('Video can play:', currentStep.videoSrc)}
            >
              {#if currentStep.videoSrc}
                <source src={currentStep.videoSrc} type="video/mp4" />
              {/if}
              Your browser does not support the video tag.
            </video>
          </div>
        {:else if currentStep.visual === 'yearly-trend' || currentStep.visual === 'yearly-analysis'}
          <div class="chart-container">
            {#if dataLoaded && marmarayData.yearly}
              <YearlyTrendChart
                data={marmarayData.yearly}
                width={600}
                height={400}
                title="Yıllara Göre İntihar Vakaları"
                lineProgress={currentStep.id === 'step-5-1' ? lineProgress : 1}
                highlightYear={(
                  currentStep?.visual && currentStep.visual.includes('yearly')
                ) ?
                  2023
                : null}
                highlightRadius={10}
              />
            {/if}
          </div>
        {:else if currentStep.visual === 'weekly-distribution'}
          <div class="chart-container">
            {#if dataLoaded && marmarayData.weekly}
              <WeeklyDistributionChart
                data={marmarayData.weekly}
                width={600}
                height={400}
                title="Günlere Göre Dağılım"
                barProgress={currentStep.id === 'step-9-1' ?
                  barProgressShifted(weeklyProgress)
                : 1}
              />
            {/if}
          </div>
        {:else if currentStep.visual === 'station-heatmap'}
          <MarmarayLineChart
            width={900}
            height={500}
            showIncidents={true}
            highlightStations={currentStep.id === 'step-12-3' ?
              ['Yenikapı', 'Bostancı', 'Ayrılık Çeşmesi']
            : []}
          />
        {:else if currentStep.visual === 'communication-timeline'}
          <div class="chart-container communication-chart-container">
            <!-- Interactive Word Cloud -->
            <InteractiveWordCloud />
          </div>
        {:else if currentStep.visual === 'metro-monthly'}
          <div class="chart-container">
            {#if dataLoaded && metroData.monthly?.length}
              <MetroMonthlyChart
                data={metroData.monthly}
                width={600}
                height={400}
                title="Metro İstanbul'da aylara göre vakalar"
                animationProgress={currentStep.id === 'step-14-1' ?
                  metroProgressShifted(metroMonthlyProgress)
                : 1}
              />
            {/if}
          </div>
        {:else if currentStep.visual === 'text-only'}
          <!-- Text-only step - no visual content needed -->
          <div class="text-only-placeholder"></div>
        {:else if currentStep.visual === 'european-data'}
          <div class="chart-container">
            {#if dataLoaded && marmarayData.europeAverages?.length}
              <EuropeanSuicideChart
                data={marmarayData.europeAverages}
                width={600}
                height={400}
                title="AB Ülkelerinde Yıllık Ortalama İntihar Sayıları"
                animationProgress={europeanProgress}
              />
            {:else}
              <div class="loading-chart">
                <div class="loading-spinner"></div>
                <p>Veriler yükleniyor...</p>
                <p style="font-size: 0.8rem; color: #999; margin-top: 0.5rem;">
                  Data loaded: {dataLoaded ? 'Yes' : 'No'} | Europe data: {marmarayData
                    .europeAverages?.length || 0} items
                </p>
              </div>
            {/if}
          </div>
        {:else if currentStep.visual === 'durkheim-theory'}
          <div class="chart-container">
            <DurkheimTheoryChart
              width={600}
              height={400}
              animationProgress={durkheimProgress}
              currentStep={currentStep.id}
            />
          </div>
        {:else if currentStep.visual === 'global-solutions'}
          <div class="chart-container">
            {#if isGlobalSolutionsStep(currentStep.id)}
              <GlobalSolutionsSwarm
                width={800}
                height={420}
                stepId={currentStep.id}
                data={globalSolutionsData}
                cityFilter={currentStep.id === 'step-18.2' ? 'Tokyo'
                : currentStep.id === 'step-18.3' ? 'London'
                : currentStep.id === 'step-18.4' ? 'Seoul'
                : currentStep.id === 'step-18.5' ? 'Paris'
                : null}
                highlightedCity={currentStep.id === 'step-18.2' ? 'Tokyo'
                : currentStep.id === 'step-18.3' ? 'London'
                : currentStep.id === 'step-18.4' ? 'Seoul'
                : currentStep.id === 'step-18.5' ? 'Paris'
                : null}
              />
            {:else}
              <div class="solutions-container">
                <h3>Dünya Örnekleri</h3>
                <div class="solution-cards">
                  <div class="solution-card">
                    <h4>Tokyo</h4>
                    <p>Platform kapıları ve mavi LED ışıklar</p>
                  </div>
                  <div class="solution-card">
                    <h4>Londra</h4>
                    <p>Ray altı çukurlar ve personel eğitimi</p>
                  </div>
                  <div class="solution-card">
                    <h4>Seul</h4>
                    <p>Tam platform kapı sistemi</p>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else if currentStep.visual === 'expert-solutions'}
          <!-- Expert solutions visual removed - now just text -->
        {:else if currentStep.visual === 'global-solutions'}
          <div class="solutions-container">
            <h3>Dünya Örnekleri</h3>
            <div class="solution-cards">
              <div class="solution-card">
                <h4>Tokyo</h4>
                <p>Platform kapıları ve mavi LED ışıklar</p>
              </div>
              <div class="solution-card">
                <h4>Londra</h4>
                <p>Ray altı çukurlar ve personel eğitimi</p>
              </div>
              <div class="solution-card">
                <h4>Seul</h4>
                <p>Tam platform kapı sistemi</p>
              </div>
            </div>
          </div>
        {:else if currentStep.id === 'step-10-3'}
          <!-- Split Screen: Two Maps Side by Side -->
          <div class="split-map-container fullscreen">
            <div class="split-map-left">
              <MapboxMap
                target="guzelyali"
                height={1000}
                showMarmarayLine={true}
                showIncidents={true}
                highlightStations={true}
                enable3DBuildings={false}
                interactive={false}
              />
              <div class="map-label">Güzelyalı</div>
            </div>
            <div class="split-divider"></div>
            <div class="split-map-right">
              <MapboxMap
                target="darica"
                height={1000}
                showMarmarayLine={true}
                showIncidents={true}
                highlightStations={true}
                enable3DBuildings={false}
                interactive={false}
              />
              <div class="map-label">Darıca</div>
            </div>
          </div>
        {:else}
          <!-- Default: Map View -->
          <div
            class="map-container {(
              currentStepIndex <= 2 ||
              currentStep.visual === 'station-focus' ||
              currentStep.visual === 'marmaray-line'
            ) ?
              'fullscreen'
            : ''}"
          >
            <MapboxMap
              target={mapTarget}
              height={(
                currentStepIndex <= 2 ||
                currentStep.visual === 'station-focus' ||
                currentStep.visual === 'marmaray-line'
              ) ?
                1000
              : 600}
              showMetroLines={isStep('step-2-2')}
              showMetroStations={isStep('step-2-2')}
              showMarmarayLine={!isStep('step-2-2')}
              showIncidents={currentStep.visual === 'station-heatmap' ||
                currentStep.visual === 'station-focus'}
              highlightStations={true}
              enable3DBuildings={false}
              interactive={false}
            />
          </div>
        {/if}
      {/if}
    </div>
  </ScrollytellingEngine>

  <!-- Seamless Bubble Transition Overlay -->
  <SeamlessBubbleTransition
    isTransitioning={currentStep?.id === 'step-19'}
    fromChartBounds={{ x: 0, y: 0, width: 800, height: 420 }}
    toChartBounds={{ x: 0, y: 0, width: 600, height: 400 }}
    europeanData={marmarayData.europeAverages || []}
  />

  {#if currentStep}
    <div class="step-badge" aria-hidden="true">{currentStep.id}</div>
  {/if}

  <!-- Story Footer -->
  <svelte:component this={BlockAny} class="story-footer">
    <div class="footer-inner">
      <p>© Scroli Graphics</p>
    </div>
  </svelte:component>
</div>

<style lang="scss">
  @use '@reuters-graphics/graphics-components/dist/scss/mixins' as mixins;

  .story-container {
    min-height: 100vh;
    background: white;
  }

  /* removed unused header styles */

  // Scrollytelling Layout
  :global(.scrollytelling-container) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    min-height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  // Text Steps (Right Column)
  .step-container {
    padding: 2rem 0;
    min-height: 60vh;
    display: flex;
    align-items: flex-start;
    padding-top: 4rem;
  }

  .step-content {
    max-width: 500px;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    margin-left: auto;
    margin-top: 0;

    h2 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .step-text {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 1rem;
      line-height: 1.6;
      color: #4a5568;
    }

    &.active {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }

  /* Step 3 now handled by FullWidthBody */

  /* Graphic Area (Left Column) */
  .graphic-container {
    position: sticky;
    top: 2rem;
    height: calc(100vh - 4rem);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .video-frame {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .video-frame.left {
    justify-content: flex-start;
  }
  .video-frame.center {
    justify-content: center;
  }
  .video-frame.right {
    justify-content: flex-end;
  }
  .video-frame video {
    width: min(720px, 90%);
    border-radius: 12px;
    background: #000;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }

  .video-caption {
    max-width: 520px;
    padding: 1rem 0;
    color: #374151;
  }

  .hidden-graphic {
    display: none;
  }

  /* Left align the graphic area for station-heatmap steps */
  .graphic-container.align-left {
    justify-content: flex-start;
  }

  /* Step 3: Break out of two-column grid for full-width centered body */
  .step-container.fullwidth-step {
    grid-column: 1 / -1; /* Span all columns */
    position: relative;
    z-index: 10;
  }

  .step-container.fullwidth-step :global(.fullwidth-body) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 760px;
  }

  .map-container {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .map-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
    z-index: 0; /* lower than header/text */
  }

  /* Split Screen Map Layout */
  .split-map-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    display: flex;
    align-items: center;
    animation: splitScreenZoomIn 1.2s ease-out;
  }

  @keyframes splitScreenZoomIn {
    0% {
      transform: scale(1.2);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .split-map-left,
  .split-map-right {
    flex: 1;
    height: 100vh;
    position: relative;
  }

  .split-divider {
    width: 2px;
    height: 100vh;
    background: #d32f2f;
    z-index: 10;
    position: relative;
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.5);
    animation: dividerAppear 0.8s ease-out 0.4s both;
  }

  @keyframes dividerAppear {
    0% {
      opacity: 0;
      transform: scaleY(0);
      transform-origin: center;
    }
    100% {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  .map-label {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-weight: 600;
    font-size: 14px;
    z-index: 20;
    animation: labelSlideIn 0.6s ease-out 0.8s both;
  }

  @keyframes labelSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .split-map-left .map-label {
    left: 20px;
  }

  .split-map-right .map-label {
    left: 20px;
  }

  .chart-container {
    width: 100%;
    height: 100%;
    padding: 0.5rem 0; /* minimal padding */
    background: transparent; /* no box background */
    border-radius: 0; /* naked */
    box-shadow: none; /* remove shadow */
  }

  .metro-monthly-wrapper {
    padding-top: 2.5rem;
    padding-bottom: 1.5rem;
  }

  .marmaray-chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 3rem; /* Move chart down */
    padding-bottom: 2rem;
  }

  /* removed unused marmaray-chart-container h3 styles */

  .solutions-container {
    width: 100%;
    padding: 2rem;
  }

  .solutions-container h3 {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2rem;
    text-align: center;
  }

  .solution-cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  .solution-card {
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h4 {
      font-weight: 600;
      color: #d32f2f;
      margin-bottom: 0.5rem;
    }

    p {
      color: #4a5568;
      font-size: 0.9rem;
    }
  }

  /* removed default-graphic placeholder styles */

  .step-badge {
    position: fixed;
    left: 8px;
    bottom: 8px;
    z-index: 900; /* above map, below header */
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    line-height: 1;
    color: #111827;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    padding: 4px 6px;
    backdrop-filter: blur(2px);
    opacity: 0.6;
    pointer-events: none;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-size: 1rem;
    color: #6b7280;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  .loading-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 450px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #d32f2f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-chart p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
  }

  .story-footer {
    padding: 3rem 0;
    border-top: 1px solid #e5e7eb;
    margin-top: 3rem;
  }
  .footer-inner {
    color: #6b7280;
    font-size: 0.9rem;
  }

  // Mobile responsiveness
  @media (max-width: 768px) {
    :global(.scrollytelling-container) {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0 1rem;
    }

    .graphic-container {
      position: relative;
      height: 400px;
      margin-bottom: 2rem;
    }

    .step-container {
      min-height: auto;
      padding: 1rem 0;
    }

    .step-content {
      margin-left: 0;
      max-width: 100%;
    }
  }

  /* Communication Chart Styles */
  .communication-chart-container {
    padding: 0;
    background: transparent; /* naked */
    border-radius: 0;
    border: none;
    width: 100%;
    max-width: none;
    margin: 6rem 0 0; /* push down but keep left aligned */
    display: flex;
    align-items: center; /* vertical centering */
    justify-content: flex-start; /* align cloud to left */
  }

  .word-usage {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .word-comparison {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  /* Mobile responsiveness for communication chart */
  @media (max-width: 768px) {
    .word-comparison {
      flex-direction: column;
      gap: 1rem;
    }

    .communication-chart-container {
      padding: 1rem;
      margin: 1rem;
    }
  }

  /* When step 3 is active, collapse to single-column and center text */
  .story-container.step3 :global(.scrollytelling-container) {
    grid-template-columns: 1fr;
  }
  .story-container.step3 .graphic-container {
    display: none;
  }
  .story-container.step3 .step-container {
    justify-content: center;
  }

  /* Video step fade transition styles */
  .video-caption {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease-out,
      transform 0.6s ease-out;
  }

  .video-caption.fade-in {
    opacity: 1;
    transform: translateY(0);
  }

  .video-title {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  .video-description {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: #4a5568;
  }

  /* Step content styles */
  .step-content {
    max-width: 100%;
  }

  .step-headline {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .step-text {
    font-family:
      'Reuters',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 1.125rem;
    line-height: 1.7;
    color: #374151;
    margin: 0;
  }
</style>
