export interface PresetPlaylist {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  m3uUrl: string;
  epgUrl?: string;
  badge: string;
  iconName: string;
  sampleChannels: string[];
  m3uRawContent?: string;
  epgRawContent?: string;
}

export const PRESET_PLAYLISTS: PresetPlaylist[] = [
  {
    id: 'preset-iptv-api-index',
    nameAr: 'قنوات IptvApi الشاملة (iptv/index.m3u)',
    nameEn: 'IptvApi Complete Suite (iptv/index.m3u)',
    descriptionAr: 'الباقة البرمجية الشاملة لقنوات البث المباشر (رياضة، سينما 4K، أخبار، وقنوات عربية) المتوافقة مع كود Kotlin M3UParser.',
    descriptionEn: 'Full IPTV channel suite from /iptv/index.m3u endpoint compatible with Kotlin Retrofit IptvApi and M3UParser.',
    m3uUrl: '/iptv/index.m3u',
    epgUrl: 'https://iptv-org.github.io/epg/guides/ar/beinsports.net.epg.xml',
    badge: 'IptvApi Retrofit',
    iconName: 'Code2',
    sampleChannels: ['beIN SPORTS 1 HD', 'Fenk Action Cinema 4K', 'Fenk Sci-Fi & Marvel 4K', 'Hollywood Premiere 4K', 'الجزيرة الإخبارية HD', 'ENTV Algeria 1 HD'],
    m3uRawContent: `#EXTM3U url-tvg="https://iptv-org.github.io/epg/guides/ar/beinsports.net.epg.xml"

#EXTINF:-1 tvg-id="beINSPORTS1.qa" tvg-name="beIN SPORTS 1 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports 1080p" tvg-chno="201",beIN SPORTS 1 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS2.qa" tvg-name="beIN SPORTS 2 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports 1080p" tvg-chno="202",beIN SPORTS 2 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4

#EXTINF:-1 tvg-id="beINSPORTS3.qa" tvg-name="beIN SPORTS 3 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="203",beIN SPORTS 3 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4

#EXTINF:-1 tvg-id="beINSPORTS4.qa" tvg-name="beIN SPORTS 4 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="204",beIN SPORTS 4 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4

#EXTINF:-1 tvg-id="beINSPORTS5.qa" tvg-name="beIN SPORTS 5 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="205",beIN SPORTS 5 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS6.qa" tvg-name="beIN SPORTS 6 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="206",beIN SPORTS 6 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4

#EXTINF:-1 tvg-id="beINSPORTS1XTRA.qa" tvg-name="beIN SPORTS 1 Xtra VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="207",beIN SPORTS 1 Xtra VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="FenkCinema1" tvg-name="Fenk Action Cinema 4K" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="401",Fenk Action Cinema 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="FenkCinema2" tvg-name="Fenk Sci-Fi & Marvel 4K" tvg-logo="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="402",Fenk Sci-Fi & Marvel 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="FenkCinema3" tvg-name="Fenk Animation & Family HD" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="403",Fenk Animation & Family HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

#EXTINF:-1 tvg-id="FenkCinema4" tvg-name="Hollywood Premiere 4K" tvg-logo="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="404",Hollywood Premiere 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="FenkCinema5" tvg-name="Arabic Cinema Al Oula HD" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="405",Arabic Cinema Al Oula HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="AlJazeera.qa" tvg-name="Al Jazeera Arabic HD" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="301",الجزيرة الإخبارية HD
https://live-hls-aljazeera-arabic.akamaized.net/hls/live/2002827/aljazeera/arabic/master.m3u8

#EXTINF:-1 tvg-id="AlJazeeraDoc.qa" tvg-name="Al Jazeera Documentary" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="302",الجزيرة الوثائقية HD
https://live-hls-aljazeera-doc.akamaized.net/hls/live/2002828/aljazeera/doc/master.m3u8

#EXTINF:-1 tvg-id="AlgeriaTV1.dz" tvg-name="ENTV Algeria 1 HD" tvg-logo="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="303",التلفزيون الجزائري 1 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="Echourouk.dz" tvg-name="Echourouk News TV" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="304",قناة الشروق الإخبارية
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`,
  },
  {
    id: 'preset-iptv-api-movies',
    nameAr: 'قنوات أفلام IptvApi (iptv/categories/movies.m3u)',
    nameEn: 'IptvApi Movie Category (iptv/categories/movies.m3u)',
    descriptionAr: 'قنوات الأفلام المخصصة المستخرجة من دالة getMovieChannels() بجودة 4K للأكشن والخيال العلمي وهوليوود.',
    descriptionEn: 'Dedicated 4K movie streams matching IptvApi.getMovieChannels() endpoint.',
    m3uUrl: '/iptv/categories/movies.m3u',
    badge: 'Movies Category M3U',
    iconName: 'Film',
    sampleChannels: ['Fenk Action Cinema 4K', 'Fenk Sci-Fi & Marvel 4K', 'Hollywood Premiere 4K', 'Warner Bros Action HD', 'Universal Thrillers 4K'],
    m3uRawContent: `#EXTM3U

#EXTINF:-1 tvg-id="FenkCinema1" tvg-name="Fenk Action Cinema 4K" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="401",Fenk Action Cinema 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="FenkCinema2" tvg-name="Fenk Sci-Fi & Marvel 4K" tvg-logo="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="402",Fenk Sci-Fi & Marvel 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="FenkCinema3" tvg-name="Fenk Animation & Family HD" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="403",Fenk Animation & Family HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

#EXTINF:-1 tvg-id="FenkCinema4" tvg-name="Hollywood Premiere 4K" tvg-logo="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="404",Hollywood Premiere 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="FenkCinema5" tvg-name="Arabic Cinema Al Oula HD" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="405",Arabic Cinema Al Oula HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="FenkCinema6" tvg-name="Warner Bros Action HD" tvg-logo="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="406",Warner Bros Action HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="FenkCinema7" tvg-name="Universal Thrillers 4K" tvg-logo="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="407",Universal Thrillers 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4`,
  },
  {
    id: 'preset-bein-sports-full',
    nameAr: 'باقة beIN SPORTS العالمية و قنوات VEGA HD',
    nameEn: 'beIN SPORTS Global & VEGA HD Package',
    descriptionAr: 'قنوات beIN 1 إلى 9 بجودة 1080p وقنوات VEGA الرياضية فائقة السرعة مع دليل البرامج.',
    descriptionEn: 'beIN SPORTS 1 to 9 in 1080p and high-speed VEGA feeds with live EPG schedule.',
    m3uUrl: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/sports.m3u',
    epgUrl: 'https://iptv-org.github.io/epg/guides/ar/beinsports.net.epg.xml',
    badge: '1080p HD / 4K',
    iconName: 'Trophy',
    sampleChannels: ['beIN SPORTS 1 HD', 'beIN SPORTS 2 HD', 'beIN SPORTS 3 VEGA', 'beIN SPORTS 4 VEGA', 'beIN SPORTS 1 Xtra'],
    m3uRawContent: `#EXTM3U url-tvg="https://iptv-org.github.io/epg/guides/ar/beinsports.net.epg.xml"

#EXTINF:-1 tvg-id="beINSPORTS3.qa" tvg-name="beIN SPORTS 3 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="203",beIN SPORTS 3 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS4.qa" tvg-name="beIN SPORTS 4 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="204",beIN SPORTS 4 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4

#EXTINF:-1 tvg-id="beINSPORTS5.qa" tvg-name="beIN SPORTS 5 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="205",beIN SPORTS 5 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4

#EXTINF:-1 tvg-id="beINSPORTS6.qa" tvg-name="beIN SPORTS 6 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="206",beIN SPORTS 6 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4

#EXTINF:-1 tvg-id="beINSPORTS7.qa" tvg-name="beIN SPORTS 7 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="207",beIN SPORTS 7 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS8.qa" tvg-name="beIN SPORTS 8 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="208",beIN SPORTS 8 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4

#EXTINF:-1 tvg-id="beINSPORTS9.qa" tvg-name="beIN SPORTS 9 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="209",beIN SPORTS 9 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="beINSPORTS1EN.qa" tvg-name="beIN SPORTS 1 English VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="210",beIN SPORTS 1 English VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS1XTRA.qa" tvg-name="beIN SPORTS 1 Xtra VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN VEGA" tvg-chno="211",beIN SPORTS 1 Xtra VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4

#EXTINF:-1 tvg-id="beINSPORTS4HD.qa" tvg-name="beIN SPORTS 4 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="212",beIN SPORTS 4 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4

#EXTINF:-1 tvg-id="beINSPORTS5HD.qa" tvg-name="beIN SPORTS 5 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="213",beIN SPORTS 5 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS6HD.qa" tvg-name="beIN SPORTS 6 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="214",beIN SPORTS 6 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4

#EXTINF:-1 tvg-id="beINSPORTS7HD.qa" tvg-name="beIN SPORTS 7 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="215",beIN SPORTS 7 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="beINSPORTS8HD.qa" tvg-name="beIN SPORTS 8 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="216",beIN SPORTS 8 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS9HD.qa" tvg-name="beIN SPORTS 9 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN 1080p" tvg-chno="217",beIN SPORTS 9 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`,
    epgRawContent: `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="FenkTV-EPG">
  <channel id="beINSPORTS3.qa">
    <display-name>beIN SPORTS 3 VEGA</display-name>
    <icon src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&amp;w=800&amp;auto=format&amp;fit=crop" />
  </channel>
  <programme start="20260824190000 +0000" stop="20260824213000 +0000" channel="beINSPORTS3.qa">
    <title lang="ar">الدوري الإنجليزي الممتاز: مانشستر سيتي ضد آرسنال (مباشر)</title>
    <desc lang="ar">مباراة قمة البريميرليغ من ملعب الاتحاد بتعليق عصام الشوالي واستوديو تحليلي مباشر.</desc>
    <category lang="ar">Sports</category>
  </programme>
  <programme start="20260824213000 +0000" stop="20260824230000 +0000" channel="beINSPORTS3.qa">
    <title lang="ar">برنامج حصاد البريميرليغ والأهداف العالمية</title>
    <desc lang="ar">تحليل فني لأبرز لقطات الجولة وأهداف المباريات.</desc>
    <category lang="ar">Sports</category>
  </programme>

  <channel id="beINSPORTS4.qa">
    <display-name>beIN SPORTS 4 VEGA</display-name>
  </channel>
  <programme start="20260824193000 +0000" stop="20260824220000 +0000" channel="beINSPORTS4.qa">
    <title lang="ar">كلاسيكو الدوري الإسباني: ريال مدريد ضد برشلونة (مباشر)</title>
    <desc lang="ar">البث المباشر لقمة الليغا الإسبانية من ملعب سانتياغو برنابيو بتعليق حفيظ دراجي.</desc>
    <category lang="ar">Sports</category>
  </programme>
  <programme start="20260824220000 +0000" stop="20260824233000 +0000" channel="beINSPORTS4.qa">
    <title lang="ar">الليغا شو وتحليل مجريات الكلاسيكو</title>
    <desc lang="ar">أبرز ردود الأفعال والمؤتمرات الصحفية للمدربين.</desc>
    <category lang="ar">Sports</category>
  </programme>

  <channel id="beINSPORTS6.qa">
    <display-name>beIN SPORTS 6 VEGA</display-name>
  </channel>
  <programme start="20260824180000 +0000" stop="20260824203000 +0000" channel="beINSPORTS6.qa">
    <title lang="ar">دوري أبطال إفريقيا: الأهلي ضد الترجي التونسي (مباشر)</title>
    <desc lang="ar">مواجهة نارية في نصف نهائي دوري أبطال إفريقيا.</desc>
    <category lang="ar">Sports</category>
  </programme>

  <channel id="beINSPORTS8.qa">
    <display-name>beIN SPORTS 8 VEGA</display-name>
  </channel>
  <programme start="20260824170000 +0000" stop="20260824200000 +0000" channel="beINSPORTS8.qa">
    <title lang="ar">سباق جائزة بلجيكا الكبرى للفورمولا 1 (مباشر F1)</title>
    <desc lang="ar">جولة السرعة والإثارة من حلبة سبا فرانكورشان مع التحليل الفني والسرعات اللحظية.</desc>
    <category lang="ar">Sports</category>
  </programme>
</tv>`,
  },
  {
    id: 'preset-arab-channels-news',
    nameAr: 'باقة القنوات العربية والأخبار والوثائقيات',
    nameEn: 'Arab News & Documentary HD Suite',
    descriptionAr: 'قنوات الجزيرة والحدث والعربية وناشيونال جيوغرافيك والتلفزيون الجزائري.',
    descriptionEn: 'Al Jazeera, Al Hadath, National Geographic Abu Dhabi and Algerian TV streams.',
    m3uUrl: 'https://iptv-org.github.io/iptv/countries/dz.m3u',
    epgUrl: 'https://iptv-org.github.io/epg/guides/ar/aljazeera.net.epg.xml',
    badge: 'Arab & MENA',
    iconName: 'Globe',
    sampleChannels: ['الجزيرة الإخبارية HD', 'الجزيرة الوثائقية', 'العربية الحدث', 'التلفزيون الجزائري 1', 'قناة الشروق الإخبارية'],
    m3uRawContent: `#EXTM3U url-tvg="https://iptv-org.github.io/epg/guides/ar/aljazeera.net.epg.xml"

#EXTINF:-1 tvg-id="AlJazeera.qa" tvg-name="Al Jazeera Arabic HD" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="301",الجزيرة الإخبارية HD
https://live-hls-aljazeera-arabic.akamaized.net/hls/live/2002827/aljazeera/arabic/master.m3u8

#EXTINF:-1 tvg-id="AlJazeeraDoc.qa" tvg-name="Al Jazeera Documentary" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="302",الجزيرة الوثائقية HD
https://live-hls-aljazeera-doc.akamaized.net/hls/live/2002828/aljazeera/doc/master.m3u8

#EXTINF:-1 tvg-id="AlgeriaTV1.dz" tvg-name="ENTV Algeria 1" tvg-logo="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="303",التلفزيون الجزائري 1 HD
https://dash.algeriatv.dz/live/entv1/playlist.m3u8

#EXTINF:-1 tvg-id="Echourouk.dz" tvg-name="Echourouk News TV" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="304",قناة الشروق الإخبارية
https://edge.echouroukonline.com/live/echourouknews/index.m3u8`,
  },
  {
    id: 'preset-cinema-movies-247',
    nameAr: 'باقة سينما فنك والأفلام الأجنبية 24/7',
    nameEn: 'Fenk Cinema & Movie Channels 24/7',
    descriptionAr: 'قنوات أفلام الأكشن والخيال العلمي والدراما العالمية مع بث مباشر مستمر بجودة 4K.',
    descriptionEn: 'Action, Sci-Fi and Hollywood cinema streams in 4K continuous broadcast.',
    m3uUrl: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
    badge: '4K Cinema',
    iconName: 'Film',
    sampleChannels: ['Fenk Action Cinema 4K', 'Fenk Sci-Fi & Marvel', 'Fenk Classics HD', 'Hollywood Premiere'],
    m3uRawContent: `#EXTM3U

#EXTINF:-1 tvg-id="FenkCinema1" tvg-name="Fenk Action Cinema 4K" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما" tvg-chno="401",Fenk Action Cinema 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="FenkCinema2" tvg-name="Fenk Sci-Fi & Space" tvg-logo="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما" tvg-chno="402",Fenk Sci-Fi & Adventure
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="FenkCinema3" tvg-name="Fenk Animation & Family" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما" tvg-chno="403",Fenk Animation HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4`,
  },
];
