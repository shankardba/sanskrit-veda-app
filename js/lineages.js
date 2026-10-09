// Guru–disciple lineages: data + a small layout/renderer.
//
// Nodes sit on a hand-assigned grid (col, row) so each lineage reads top-down
// as a column; edges are drawn afterwards in an SVG overlay measured from the
// rendered cards, so card heights can vary freely.
//
// Edge types:
//   diksha      — initiation / direct discipleship
//   sannyasa    — monastic order (Daśanāmī branch) the monk was ordained into
//   succession  — institutional continuity (founded / led)
//   encounter   — a documented meeting outside the formal line
//   parallel    — a thematic parallel between the lineages (no meeting)
//   textual     — a teaching carried by text/translation rather than initiation
//
// Routing flags: `late` bends just above the child (so a fan of children
// in the next row doesn't cut through a sibling card), `bend` arcs out to
// a side, `toSide` drops straight down into a card's side, and `onSelect`
// draws the link only when one of its ends is selected.

const LINEAGES = {
  ramakrishna: { name: 'Ramakrishna–Vivekananda', note: 'Advaita Vedānta · Ramakrishna Order' },
  kriya: { name: 'Kriyā Yoga', note: 'Babaji · Lahiri · Yukteswar · Yogananda' },
  chinmaya: { name: 'Chinmaya', note: 'Sivananda · Tapovan · Chinmayananda' },
  ramana: { name: 'Ramaṇa', note: 'Arunachala · self-enquiry' },
  root: { name: 'Root', note: '' },
  order: { name: 'Daśanāmī orders', note: '' }
};

const PEOPLE = [
  {
    id: 'shankara', lineage: 'root', col: 5, row: 0,
    name: 'Ādi Śaṅkara', deva: 'आदि शङ्कर', dates: 'c. 8th century',
    role: 'Advaita teacher; organiser of the Daśanāmī monastic orders',
    summary: 'Tradition credits Śaṅkara with gathering wandering renunciates into ten named orders (daśa-nāmī, "ten names") — Giri, Purī, Bhāratī, Sarasvatī and others. All three lineages on this page take their sannyāsa through these orders: Ramakrishna through a Purī monk, Yukteswar and Yogananda as Giris, Sivananda and Chinmayananda as Sarasvatīs. Ramana Maharshi belongs to no order, but his teaching links back to Śaṅkara\'s texts.'
  },

  // --- The three Daśanāmī branches that carry these lineages ---------------
  {
    id: 'puri', lineage: 'order', col: 2, row: 1, kind: 'order',
    name: 'Purī order', deva: 'पुरी', dates: 'Daśanāmī branch',
    role: 'One of the ten names; traditionally attached to the Śṛṅgerī maṭha',
    etym: 'purī — "city, fortress".',
    summary: 'Totāpurī was a Purī monk, and Ramakrishna\'s sannyāsa came through him; the Ramakrishna Order is therefore usually counted in the Purī line, though its monks do not use the suffix.'
  },
  {
    id: 'giri', lineage: 'order', col: 5, row: 1, kind: 'order',
    name: 'Giri order', deva: 'गिरि', dates: 'Daśanāmī branch',
    role: 'One of the ten names; traditionally attached to the Jyotir maṭha (Joshimath)',
    etym: 'giri — "mountain".',
    summary: 'Sri Yukteswar took formal sannyāsa as a Giri and gave the same to Yogananda in 1915; Kriyā Yoga itself came to them separately, through Babaji and Lahiri Mahasaya. SRF monastics who take final vows still receive Giri names.'
  },
  {
    id: 'sarasvati', lineage: 'order', col: 7, row: 1, kind: 'order',
    name: 'Sarasvatī order', deva: 'सरस्वती', dates: 'Daśanāmī branch',
    role: 'One of the ten names; traditionally attached to the Śṛṅgerī maṭha',
    etym: 'sarasvatī — the goddess of learning; also the river.',
    summary: 'Swami Sivananda received sannyāsa in this order in 1924 from Swami Viśvānanda Sarasvatī, and passed it on to Chinmayananda, whose monks still carry the Sarasvatī name.'
  },

  // --- Ramakrishna–Vivekananda ---------------------------------------------
  {
    id: 'bhairavi', lineage: 'ramakrishna', col: 0, row: 2,
    name: 'Bhairavī Brāhmaṇī', deva: 'भैरवी ब्राह्मणी', dates: 'fl. 1860s',
    role: 'Tantric teacher of Ramakrishna (from 1861)',
    summary: 'A wandering woman ascetic who guided Ramakrishna through the full course of Tantric sādhana at Dakshineswar and was among the first to declare him an avatāra.'
  },
  {
    id: 'totapuri', lineage: 'ramakrishna', col: 2, row: 2,
    name: 'Totāpurī', deva: 'तोतापुरी', dates: 'fl. 1860s',
    role: 'Purī-order Advaita monk; gave Ramakrishna sannyāsa (c. 1865)',
    summary: 'A naked (nāgā) monk of the Purī order who stayed eleven months at Dakshineswar, initiated Ramakrishna into sannyāsa and taught him nirvikalpa samādhi — the formless, non-dual absorption of Advaita.'
  },
  {
    id: 'ramakrishna', lineage: 'ramakrishna', col: 1, row: 3,
    name: 'Śrī Rāmakṛṣṇa', deva: 'श्री रामकृष्ण', dates: '1836–1886', born: 'Gadadhar Chattopadhyay',
    role: 'Priest of the Kālī temple at Dakshineswar',
    etym: 'Rāma + Kṛṣṇa — the two great avatāras of Viṣṇu in one name.',
    summary: 'Practised Tantra, Vaiṣṇava devotion and Advaita in turn (and, briefly, Islam and Christianity) and taught that they arrive at one reality. His conversations, recorded by "M.", became the Kathāmṛta (The Gospel of Sri Ramakrishna).'
  },
  {
    id: 'sarada', lineage: 'ramakrishna', col: 0, row: 4,
    name: 'Śāradā Devī', deva: 'शारदा देवी', dates: '1853–1920',
    role: 'Wife and spiritual consort of Ramakrishna; the "Holy Mother"',
    summary: 'After Ramakrishna\'s death she became the guide of his young monastic disciples and gave initiation to many; the Ramakrishna Order regards her as its spiritual mother.'
  },
  {
    id: 'vivekananda', lineage: 'ramakrishna', col: 1, row: 4,
    name: 'Svāmī Vivekānanda', deva: 'स्वामी विवेकानन्द', dates: '1863–1902', born: 'Narendranath Datta',
    role: 'Chief disciple of Ramakrishna; brought Vedānta to the West',
    etym: 'viveka ("discernment" — telling the real from the unreal) + ānanda ("bliss").',
    summary: 'Met Ramakrishna in 1881. Spoke at the Parliament of the World\'s Religions in Chicago (1893), founded the Vedanta Society of New York (1894) and the Ramakrishna Mission (1897), and wrote Rāja Yoga (1896), an influential commentary on Patañjali.'
  },
  {
    id: 'mgupta', lineage: 'ramakrishna', col: 2, row: 4,
    name: 'Mahendranāth Gupta ("M.")', deva: 'महेन्द्रनाथ गुप्त', dates: '1854–1932',
    role: 'Householder disciple; recorder of the Kathāmṛta',
    summary: 'A Calcutta schoolmaster who kept a diary of Ramakrishna\'s conversations from 1882 to 1886, published in Bengali as Śrī Śrī Rāmakṛṣṇa Kathāmṛta. Yogananda knew him as a boy — "Master Mahasaya" in Autobiography of a Yogi.'
  },
  {
    id: 'brahmananda', lineage: 'ramakrishna', col: 0, row: 5,
    name: 'Svāmī Brahmānanda', deva: 'स्वामी ब्रह्मानन्द', dates: '1863–1922', born: 'Rakhal Chandra Ghosh',
    role: 'Brother-disciple of Vivekananda; first President of the Ramakrishna Math & Mission',
    etym: 'brahma + ānanda — "the bliss of Brahman".',
    summary: 'Ramakrishna regarded him as his "spiritual son". He led the young Order for over two decades after Vivekananda\'s death.'
  },
  {
    id: 'rkmission', lineage: 'ramakrishna', col: 0, row: 6, kind: 'institution',
    name: 'Ramakrishna Math & Mission', dates: 'founded 1897', place: 'Belur Math, near Kolkata',
    role: 'The monastic order and its service wing',
    summary: 'Founded by Vivekananda on 1 May 1897. Its monks receive sannyāsa within the Order and take names ending in -ānanda; its branch centres overseas include the Vedanta Societies.'
  },
  {
    id: 'vsny', lineage: 'ramakrishna', col: 1, row: 6, kind: 'institution',
    name: 'Vedanta Society of New York', dates: 'founded 1894', place: 'New York',
    role: 'The first Vedānta society in the West',
    summary: 'Founded by Vivekananda during his first American tour; it has been led ever since by monks sent from the Ramakrishna Order.'
  },
  {
    id: 'sarvapriyananda', lineage: 'ramakrishna', col: 1, row: 7,
    name: 'Svāmī Sarvapriyānanda', deva: 'स्वामी सर्वप्रियानन्द', dates: 'living',
    role: 'Minister and spiritual leader, Vedanta Society of New York (since 2017)',
    etym: 'sarva ("all") + priya ("dear") + ānanda ("bliss") — "the bliss that is dear to all".',
    summary: 'Joined the Ramakrishna Order in 1994 and taught at its institutions in India before taking charge of the New York society in January 2017 — the society Vivekananda founded. Widely followed for lectures on the Māṇḍūkya Upaniṣad, Advaita and consciousness.'
  },

  // --- Kriyā Yoga ----------------------------------------------------------
  {
    id: 'babaji', lineage: 'kriya', col: 4, row: 2,
    name: 'Mahāvatār Bābājī', deva: 'महावतार बाबाजी', dates: 'dates unknown',
    role: 'Revived Kriyā Yoga (per tradition)',
    etym: 'mahā-avatāra ("great descent") + bābājī ("revered father").',
    summary: 'Known almost entirely through his disciples\' accounts, chiefly Autobiography of a Yogi (1946). He is said to have initiated Lahiri Mahasaya in the Himalayan foothills near Ranikhet in 1861.',
    caveat: 'Historicity rests on lineage testimony; no independent records.'
  },
  {
    id: 'lahiri', lineage: 'kriya', col: 4, row: 3,
    name: 'Lāhiṛī Mahāśaya', deva: 'लाहिड़ी महाशय', dates: '1828–1895', born: 'Shyama Charan Lahiri',
    role: 'Householder yogi of Varanasi; spread Kriyā Yoga',
    etym: 'mahāśaya — "great-souled", an honorific.',
    summary: 'A clerk in the military engineering department who kept his job and family while teaching Kriyā to anyone sincere, regardless of caste or creed. He is the link the popular "Babaji → Yukteswar" shorthand skips.'
  },
  {
    id: 'yukteswar', lineage: 'kriya', col: 4, row: 4,
    name: 'Svāmī Śrī Yukteśvar Giri', deva: 'श्रीयुक्तेश्वर गिरि', dates: '1855–1936', born: 'Priya Nath Karar',
    role: 'Disciple of Lahiri; guru of Yogananda',
    etym: 'yukta ("united") + īśvara ("the Lord") — "one united with God". Giri ("mountain") is his Daśanāmī branch.',
    summary: 'Ran ashrams at Serampore and Puri. At Babaji\'s request (after their meeting at the 1894 Kumbha Mela) he wrote Kaivalya Darśanam — The Holy Science, comparing the Bible with Hindu scripture and setting out his yuga chronology.'
  },
  {
    id: 'yogananda', lineage: 'kriya', col: 4, row: 5,
    name: 'Paramahaṃsa Yogānanda', deva: 'परमहंस योगानन्द', dates: '1893–1952', born: 'Mukunda Lal Ghosh',
    role: 'Brought Kriyā Yoga to the West; author of Autobiography of a Yogi',
    etym: 'yoga + ānanda — "bliss through union".',
    summary: 'Met Yukteswar in 1910 and took Giri-order sannyāsa from him in 1915. Founded Yogoda Satsanga Society (1917) in India, sailed to America in 1920 to speak in Boston, and founded Self-Realization Fellowship.'
  },
  {
    id: 'srf', lineage: 'kriya', col: 4, row: 6, kind: 'institution',
    name: 'Self-Realization Fellowship / YSS', dates: 'founded 1917 · 1920', place: 'Los Angeles · Ranchi',
    role: 'Yogananda\'s organisations',
    summary: 'Yogoda Satsanga Society of India (1917) and Self-Realization Fellowship (1920; Mount Washington HQ from 1925) carry on Kriyā initiation through Yogananda\'s lessons and monastic order.'
  },
  {
    id: 'dayamata', lineage: 'kriya', col: 5, row: 6.5,
    name: 'Śrī Dayā Mātā', deva: 'दया माता', dates: '1914–2010', born: 'Faye Wright',
    role: 'President of SRF/YSS 1955–2010',
    etym: 'dayā ("compassion") + mātā ("mother").',
    summary: 'A direct disciple who entered Yogananda\'s ashram at seventeen, she led the organisations for 55 years.'
  },
  {
    id: 'chidananda', lineage: 'kriya', col: 4, row: 7,
    name: 'Svāmī Cidānanda Giri', deva: 'स्वामी चिदानन्द गिरि', dates: 'living',
    role: 'President of SRF/YSS (since 2017)',
    etym: 'cit ("consciousness") + ānanda ("bliss").',
    summary: 'Known as Brother Chidananda; a monk of the SRF order since 1977, he succeeded Mrinalini Mata (president 2011–2017) and is the present-day head of Yogananda\'s line.'
  },
  // --- Chinmaya --------------------------------------------------------------
  {
    id: 'sivananda', lineage: 'chinmaya', col: 6, row: 2,
    name: 'Svāmī Śivānanda Sarasvatī', deva: 'स्वामी शिवानन्द', dates: '1887–1963', born: 'Kuppuswami',
    role: 'Founder of the Divine Life Society, Rishikesh (1936); gave Chinmayananda sannyāsa',
    etym: 'Śiva + ānanda — "the bliss of Śiva".',
    summary: 'A Tamil physician who practised in Malaya before renouncing, he took sannyāsa in Rishikesh in 1924 and wrote some two hundred books. In 1949 he gave sannyāsa to Balakrishna Menon, naming him Chinmayananda.'
  },
  {
    id: 'tapovan', lineage: 'chinmaya', col: 8, row: 2,
    name: 'Svāmī Tapovan Mahārāj', deva: 'स्वामी तपोवन', dates: '1889–1957', born: 'Chippukutty Nair',
    role: 'Himalayan Vedānta master at Uttarkashi; Chinmayananda\'s teacher',
    etym: 'tapo-vana — "the forest of austerity".',
    summary: 'A recluse who lived by the Ganga at Uttarkashi and Gangotri and wrote Wanderings in the Himalayas. Sivananda sent Chinmayananda to him, and he taught him the Upaniṣads and Gītā in the traditional way for about eight years.'
  },
  {
    id: 'chinmayananda', lineage: 'chinmaya', col: 7, row: 3,
    name: 'Svāmī Cinmayānanda', deva: 'स्वामी चिन्मयानन्द', dates: '1916–1993', born: 'Balakrishna Menon',
    role: 'Brought Vedānta to lay audiences in English; founded Chinmaya Mission',
    etym: 'cit-maya ("made of pure consciousness") + ānanda.',
    summary: 'A journalist who went to Rishikesh in 1947 intending to expose the sādhus and stayed. From 1951 his public "Gītā Jñāna Yajñas" taught the Gītā and Upaniṣads — long reserved for monks and Sanskrit scholars — in English to anyone. Chinmaya Mission grew up around these talks from 1953.'
  },
  {
    id: 'chinmayamission', lineage: 'chinmaya', col: 7, row: 4, kind: 'institution',
    name: 'Chinmaya Mission', dates: 'founded 1953', place: 'Mumbai · worldwide',
    role: 'Chinmayananda\'s organisation',
    summary: 'Formed by his listeners in 1953; its residential Vedānta course at Sandeepany Sadhanalaya, Mumbai (1963) trains its teachers, and Chinmaya Mission West (1975) runs its centres abroad.'
  },
  {
    id: 'dayananda', lineage: 'chinmaya', col: 8, row: 4,
    name: 'Svāmī Dayānanda Sarasvatī', deva: 'स्वामी दयानन्द', dates: '1930–2015',
    role: 'Disciple of Chinmayananda; founder of Arsha Vidya Gurukulam',
    etym: 'dayā ("compassion") + ānanda.',
    summary: 'Took sannyāsa from Chinmayananda in 1962 and later founded his own teaching line, Arsha Vidya, with gurukulams in Pennsylvania and Coimbatore. Not the 19th-century Ārya Samāj founder of the same name.'
  },
  {
    id: 'tejomayananda', lineage: 'chinmaya', col: 7, row: 5.5,
    name: 'Svāmī Tejomayānanda', deva: 'स्वामी तेजोमयानन्द', dates: 'b. 1950',
    role: 'Head of Chinmaya Mission 1993–2017',
    etym: 'tejo-maya ("full of radiance") + ānanda.',
    summary: 'Trained under Chinmayananda and led the Mission worldwide for 24 years after his death.'
  },
  {
    id: 'swaroopananda', lineage: 'chinmaya', col: 7, row: 7,
    name: 'Svāmī Svarūpānanda', deva: 'स्वामी स्वरूपानन्द', dates: 'living',
    role: 'Head of Chinmaya Mission (since 2017)',
    etym: 'svarūpa ("one\'s own true nature") + ānanda.',
    summary: 'The present head of Chinmaya Mission worldwide, succeeding Tejomayananda.'
  },
  {
    id: 'chandrasekharendra', lineage: 'chinmaya', col: 8, row: 1,
    name: 'Candraśekharendra Sarasvatī', deva: 'चन्द्रशेखरेन्द्र सरस्वती', dates: '1894–1994',
    role: '68th Śaṅkarācārya of the Kanchi Kāmakoṭi Pīṭham; "Mahā Periyavā"',
    etym: 'candra-śekhara ("moon-crested", an epithet of Śiva) + indra ("lord").',
    summary: 'Head of the Kanchi maṭha for 87 years, known in Tamil as Mahā Periyavā ("the great elder"). In January 1931 he received the young English journalist Paul Brunton and sent him on to Ramana Maharshi. Kanchi\'s claim to be one of Śaṅkara\'s own foundations is disputed by the other maṭhas.'
  },

  // --- Ramaṇa ------------------------------------------------------------------
  {
    id: 'ramana', lineage: 'ramana', col: 10, row: 1,
    name: 'Śrī Ramaṇa Maharṣi', deva: 'श्री रमण महर्षि', dates: '1879–1950', born: 'Venkataraman Iyer',
    role: 'Sage of Arunachala, Tiruvannamalai; teacher of self-enquiry',
    etym: 'Ramaṇa, short for Venkataraman, + mahā-ṛṣi ("great seer"): the name Ganapati Muni gave him in 1907.',
    summary: 'At sixteen, in Madurai, a sudden experience of death left him established in the Self. Weeks later he walked to Arunachala and never left it. He took no sannyāsa and had no human guru, and said the hill itself was his guru. His teaching is ātma-vicāra, self-enquiry, put most simply in the Tamil Nān Yār? ("Who am I?").'
  },
  {
    id: 'brunton', lineage: 'ramana', col: 9, row: 2,
    name: 'Paul Brunton', dates: '1898–1981',
    role: 'Journalist; introduced Ramana to the West',
    summary: 'Met Ramana in 1931 after the Kanchi Śaṅkarācārya directed him there. His book A Search in Secret India (1934) made Ramana known in Europe and America.'
  },
  {
    id: 'ganapati', lineage: 'ramana', col: 11, row: 2,
    name: 'Gaṇapati Muni', deva: 'गणपति मुनि', dates: '1878–1936',
    role: 'Sanskrit poet-scholar; gave Ramana his name',
    etym: 'Called Kāvyakaṇṭha, "poetry in the throat", for his gift of extempore Sanskrit verse.',
    summary: 'In 1907 he came to the young ascetic with his doubts and, after the answer, proclaimed him Bhagavān Śrī Ramaṇa Maharṣi. He recorded Ramana\'s answers as the Sanskrit Śrī Ramaṇa Gītā.'
  },
  {
    id: 'muruganar', lineage: 'ramana', col: 9, row: 3,
    name: 'Muruganār', deva: 'முருகனார்', dates: '1890–1973',
    role: 'Tamil poet; compiler of Guru Vācaka Kōvai',
    summary: 'A Tamil scholar who spent his life at Ramana\'s side writing thousands of verses. His Guru Vācaka Kōvai ("Garland of the Guru\'s Sayings") is the fullest record of the teaching, and Ramana revised it himself.'
  },
  {
    id: 'ramanasramam', lineage: 'ramana', col: 10, row: 3, kind: 'institution',
    name: 'Sri Ramanasramam', dates: 'from 1922', place: 'Tiruvannamalai',
    role: 'The ashram at the foot of Arunachala',
    summary: 'It grew up around Ramana after he moved down the hill to his mother\'s shrine in 1922. His brother\'s family still manages it, and his samādhi shrine is there.'
  },
  {
    id: 'papaji', lineage: 'ramana', col: 11, row: 3,
    name: 'H. W. L. Poonja ("Papaji")', dates: '1910–1997',
    role: 'Disciple of Ramana; teacher at Lucknow',
    summary: 'Met Ramana in 1944. Decades later his satsangs in Lucknow drew a wave of Western seekers, several of whom became teachers of self-enquiry in their own right.'
  },
  {
    id: 'gangaji', lineage: 'ramana', col: 10, row: 7,
    name: 'Gangaji', deva: 'गङ्गाजी', dates: 'b. 1942',
    role: 'American teacher of self-enquiry',
    summary: 'Met Papaji in 1990, and he gave her the name Gangaji. She teaches in the United States through the Gangaji Foundation.'
  },
  {
    id: 'mooji', lineage: 'ramana', col: 11, row: 7,
    name: 'Mooji', dates: 'b. 1954',
    role: 'Jamaican-born teacher; Monte Sahaja, Portugal',
    summary: 'Born Anthony Paul Moo-Young in Jamaica, he met Papaji in Lucknow in 1993. He now teaches self-enquiry from Monte Sahaja in Portugal.'
  }
];

const LINKS = [
  // Shared root
  { from: 'shankara', to: 'puri', type: 'sannyasa', label: 'Daśanāmī branch' },
  { from: 'shankara', to: 'giri', type: 'sannyasa', label: 'Daśanāmī branch' },
  { from: 'shankara', to: 'sarasvati', type: 'sannyasa', label: 'Daśanāmī branch' },
  { from: 'puri', to: 'totapuri', type: 'sannyasa', label: 'Purī monk' },
  { from: 'giri', to: 'yukteswar', type: 'sannyasa', label: 'Giri sannyāsa', toSide: 'right' },
  { from: 'sarasvati', to: 'sivananda', type: 'sannyasa', label: 'sannyāsa from Viśvānanda Sarasvatī, 1924' },

  // Ramakrishna line
  { from: 'bhairavi', to: 'ramakrishna', type: 'diksha', label: 'Tantric training, 1861–63' },
  { from: 'totapuri', to: 'ramakrishna', type: 'diksha', label: 'sannyāsa, c. 1865' },
  { from: 'ramakrishna', to: 'sarada', type: 'diksha', label: 'wife; taught by him' },
  { from: 'ramakrishna', to: 'vivekananda', type: 'diksha', label: 'disciple from 1881' },
  { from: 'ramakrishna', to: 'mgupta', type: 'diksha', label: 'householder disciple' },
  { from: 'ramakrishna', to: 'brahmananda', type: 'diksha', label: 'disciple' },
  { from: 'vivekananda', to: 'rkmission', type: 'succession', label: 'founded 1897' },
  { from: 'brahmananda', to: 'rkmission', type: 'succession', label: 'first President' },
  { from: 'vivekananda', to: 'vsny', type: 'succession', label: 'founded 1894' },
  { from: 'rkmission', to: 'sarvapriyananda', type: 'succession', label: 'monk of the Order, 1994' },
  { from: 'vsny', to: 'sarvapriyananda', type: 'succession', label: 'Minister since 2017' },

  // Kriyā line
  { from: 'babaji', to: 'lahiri', type: 'diksha', label: 'Kriyā initiation, 1861' },
  { from: 'lahiri', to: 'yukteswar', type: 'diksha', label: 'Kriyā initiation' },
  { from: 'babaji', to: 'yukteswar', type: 'encounter', label: 'Kumbha Mela, 1894 — asked to write The Holy Science', bend: 'left' },
  { from: 'yukteswar', to: 'yogananda', type: 'diksha', label: 'disciple 1910; sannyāsa 1915' },
  { from: 'lahiri', to: 'yogananda', type: 'encounter', label: 'blessed him as an infant; initiated his parents', bend: 'right' },
  { from: 'yogananda', to: 'srf', type: 'succession', label: 'founded 1917 / 1920' },
  { from: 'yogananda', to: 'dayamata', type: 'diksha', label: 'disciple from 1931' },
  { from: 'srf', to: 'dayamata', type: 'succession', label: 'President 1955–2010' },
  { from: 'srf', to: 'chidananda', type: 'succession', label: 'President since 2017' },

  // Chinmaya line
  { from: 'sivananda', to: 'chinmayananda', type: 'diksha', label: 'sannyāsa, 1949' },
  { from: 'tapovan', to: 'chinmayananda', type: 'diksha', label: 'studied Vedānta under him, c. 1949–57' },
  { from: 'chinmayananda', to: 'chinmayamission', type: 'succession', label: 'founded 1953' },
  { from: 'chinmayananda', to: 'dayananda', type: 'diksha', label: 'sannyāsa, 1962' },
  { from: 'chinmayananda', to: 'tejomayananda', type: 'diksha', label: 'disciple', bend: 'left' },
  { from: 'chinmayamission', to: 'tejomayananda', type: 'succession', label: 'Head 1993–2017' },
  { from: 'tejomayananda', to: 'swaroopananda', type: 'succession', label: 'succeeded as Head, 2017' },

  // Ramaṇa line
  { from: 'sarasvati', to: 'chandrasekharendra', type: 'sannyasa', label: 'Sarasvatī name; Kanchi pīṭham' },
  { from: 'ramana', to: 'brunton', type: 'diksha', label: 'met 1931', late: true },
  { from: 'ramana', to: 'ganapati', type: 'diksha', label: 'disciple from 1907; named him', late: true },
  { from: 'ramana', to: 'muruganar', type: 'diksha', label: 'disciple from 1923', late: true },
  { from: 'ramana', to: 'ramanasramam', type: 'succession', label: 'grew around him from 1922' },
  { from: 'ramana', to: 'papaji', type: 'diksha', label: 'met 1944', late: true },
  { from: 'papaji', to: 'gangaji', type: 'diksha', label: 'met 1990', late: true },
  { from: 'papaji', to: 'mooji', type: 'diksha', label: 'met 1993' },

  // Between the lineages
  { from: 'shankara', to: 'ramana', type: 'textual', cross: true,
    label: 'Vivekacūḍāmaṇi in Tamil',
    detail: 'Ramana belonged to no order and had no human guru, but in his early years at Arunachala he translated works attributed to Śaṅkara into Tamil prose: Vivekacūḍāmaṇi, Dṛg-Dṛśya-Viveka, Ātma Bodha. His self-enquiry is often read as Śaṅkara\'s Advaita made direct. The link to the root is by teaching, not by ordination.' },
  { from: 'chandrasekharendra', to: 'brunton', type: 'encounter', cross: true,
    label: 'Sent Brunton to Ramana, 1931',
    detail: 'In A Search in Secret India, Paul Brunton describes meeting the Śaṅkarācārya of Kanchi near Chingleput in January 1931. Brunton asked him for a living master, and he named the sage of Arunachala. So a Sarasvatī-order Śaṅkarācārya is the link that brought Ramana to the West.' },
  { from: 'yogananda', to: 'ramana', type: 'encounter', cross: true, onSelect: true,
    label: 'Visit to Arunachala, 1935',
    detail: 'On his 1935–36 return to India, Yogananda visited Ramana at Tiruvannamalai, an episode he includes in Autobiography of a Yogi. It is the one recorded meeting between the Kriyā line and Ramana.' },
  { from: 'mgupta', to: 'yogananda', type: 'encounter', cross: true,
    label: 'Yogananda\'s boyhood visits',
    detail: 'As a teenager in Calcutta, Yogananda often visited M. — the recorder of Ramakrishna\'s Gospel — and devotes chapter 9 of Autobiography of a Yogi ("The Blissful Devotee and His Cosmic Romance") to him as "Master Mahasaya". It is the one direct personal thread between the two lines.' },
  { from: 'vivekananda', to: 'yogananda', type: 'parallel', cross: true,
    label: 'Chicago 1893 · Boston 1920',
    detail: 'Each lineage reached America through one Bengali monk speaking at a religious congress: Vivekananda at the Parliament of the World\'s Religions (Chicago, 1893), Yogananda at the International Congress of Religious Liberals (Boston, 1920). Both then founded lasting American institutions — and both framed yoga as a science of experience rather than a creed.' },
  { from: 'vsny', to: 'srf', type: 'parallel', cross: true,
    label: 'Western institutions',
    detail: 'The Vedanta Society of New York (1894) and Self-Realization Fellowship (1920) are among the oldest Hindu-rooted spiritual organisations in continuous operation in the United States, and each is still led by a monastic order founded by its lineage.' },
  { from: 'vivekananda', to: 'chinmayananda', type: 'parallel', cross: true,
    label: 'Vedānta for everyone, in English',
    detail: 'Vivekananda\'s lectures (1890s) and Chinmayananda\'s Gītā Jñāna Yajñas (from 1951) did the same unconventional thing two generations apart: taught Advaita, normally passed on in Sanskrit to renunciates, publicly in English to householders. Both then built missions with monks trained to keep teaching that way.' },
  { from: 'sarvapriyananda', to: 'chidananda', type: 'parallel', cross: true,
    label: 'Present-day heads, both since 2017',
    detail: 'All three lines\' present-day heads on this chart took up their posts in 2017: Sarvapriyananda at the Vedanta Society of New York, Chidananda as President of SRF/YSS, and Swaroopananda as Head of Chinmaya Mission.' }
];

const LINK_TYPES = {
  diksha: 'Initiation / discipleship',
  sannyasa: 'Monastic order (Daśanāmī)',
  succession: 'Founded / led an institution',
  encounter: 'Documented meeting',
  parallel: 'Parallel between lineages',
  textual: 'Teaching through texts'
};

(function () {
  const canvas = document.getElementById('lineage-canvas');
  const svg = document.getElementById('lineage-edges');
  // Parallels are drawn above the cards: they span branches, so beneath the
  // cards they'd vanish behind the middle lineage when shown.
  const svgTop = document.getElementById('lineage-edges-top');
  const detail = document.getElementById('lineage-detail');
  const crossList = document.getElementById('lineage-cross');
  if (!canvas) return;

  const COL_W = 148, ROW_H = 132, PAD = 12;
  const onSelectOnly = l => l.type === 'parallel' || l.onSelect;

  // Fit-to-width zoom: the canvas keeps its natural size for layout (so
  // edge measurements stay simple) and is scaled inside a sizer box.
  const scroller = canvas.parentElement;
  const sizer = document.createElement('div');
  sizer.className = 'lineage-sizer';
  scroller.insertBefore(sizer, canvas);
  sizer.appendChild(canvas);
  let zoomMode = 'fit';
  function applyZoom() {
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const s = zoomMode === 'fit' ? Math.max(0.6, Math.min(1, (scroller.clientWidth - 2) / W)) : 1;
    canvas.style.transform = `scale(${s})`;
    sizer.style.width = W * s + 'px';
    sizer.style.height = H * s + 'px';
    document.querySelectorAll('[data-zoom]').forEach(b =>
      b.classList.toggle('active', b.dataset.zoom === zoomMode));
  }
  document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    zoomMode = b.dataset.zoom;
    applyZoom();
  }));
  const byId = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
  const cards = {};
  let selected = null;

  const maxCol = Math.max(...PEOPLE.map(p => p.col));
  const maxRow = Math.max(...PEOPLE.map(p => p.row));
  canvas.style.width = (maxCol + 1) * COL_W + PAD * 2 + 'px';
  canvas.style.height = (maxRow + 1) * ROW_H + PAD * 2 + 'px';

  // Lineage header bands
  [['ramakrishna', 0, 3], ['kriya', 4, 2], ['chinmaya', 6, 3], ['ramana', 9, 3]].forEach(([key, col, span]) => {
    const band = document.createElement('div');
    band.className = 'lineage-band lineage-band-' + key;
    band.style.left = PAD + col * COL_W + 'px';
    band.style.width = span * COL_W + 'px';
    band.innerHTML = `<span>${LINEAGES[key].name}</span>`;
    canvas.appendChild(band);
  });

  PEOPLE.forEach(p => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `lineage-node lineage-${p.lineage}` + (p.kind ? ` is-${p.kind}` : '');
    el.style.left = PAD + p.col * COL_W + 'px';
    el.style.top = PAD + p.row * ROW_H + 28 + 'px';
    el.dataset.id = p.id;
    el.innerHTML =
      (p.deva ? `<span class="lineage-node-deva">${p.deva}</span>` : '') +
      `<span class="lineage-node-name">${p.name}</span>` +
      `<span class="lineage-node-dates">${p.dates}</span>`;
    el.addEventListener('click', () => select(p.id));
    canvas.appendChild(el);
    cards[p.id] = el;
  });

  function anchor(el, side) {
    const x = el.offsetLeft, y = el.offsetTop, w = el.offsetWidth, h = el.offsetHeight;
    return {
      top: [x + w / 2, y], bottom: [x + w / 2, y + h],
      left: [x, y + h / 2], right: [x + w, y + h / 2]
    }[side];
  }

  function drawEdges() {
    [svg, svgTop].forEach(el => {
      el.setAttribute('width', canvas.offsetWidth);
      el.setAttribute('height', canvas.offsetHeight);
      el.innerHTML = '';
    });
    LINKS.forEach((l, i) => {
      const a = byId[l.from], b = byId[l.to];
      const ea = cards[l.from], eb = cards[l.to];
      let p1, p2, d;
      if (l.bend) {
        // Skip-a-generation link in the same column: arc out to the side so
        // it isn't hidden behind the straight line through the middle card.
        p1 = anchor(ea, l.bend); p2 = anchor(eb, l.bend);
        const bx = l.bend === 'right' ? Math.max(p1[0], p2[0]) + 46 : Math.min(p1[0], p2[0]) - 46;
        d = `M${p1} C${bx},${p1[1]} ${bx},${p2[1]} ${p2}`;
      } else if (l.toSide) {
        p1 = anchor(ea, 'bottom'); p2 = anchor(eb, l.toSide);
        d = `M${p1} L${p1[0]},${p2[1] - 24} Q${p1[0]},${p2[1]} ${p2}`;
      } else if (b.row > a.row + 0.4) {
        p1 = anchor(ea, 'bottom'); p2 = anchor(eb, 'top');
        const my = l.late ? p2[1] - 22 : (p1[1] + p2[1]) / 2;
        d = `M${p1} C${p1[0]},${my} ${p2[0]},${my} ${p2}`;
      } else {
        const rightward = b.col > a.col;
        p1 = anchor(ea, rightward ? 'right' : 'left');
        p2 = anchor(eb, rightward ? 'left' : 'right');
        const mx = (p1[0] + p2[0]) / 2;
        d = `M${p1} C${mx},${p1[1]} ${mx},${p2[1]} ${p2}`;
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', `lineage-edge edge-${l.type}`);
      path.dataset.idx = i;
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${byId[l.from].name} → ${byId[l.to].name}: ${l.label}`;
      path.appendChild(title);
      (onSelectOnly(l) ? svgTop : svg).appendChild(path);
    });
    highlight();
  }

  function highlight() {
    canvas.querySelectorAll('.lineage-edges .lineage-edge').forEach(path => {
      const l = LINKS[path.dataset.idx];
      const on = selected && (l.from === selected || l.to === selected);
      path.classList.toggle('is-active', !!on);
      path.classList.toggle('is-dim', !!selected && !on);
      // Parallels aren't lineage links; drawing them all would cross the
      // tree, so they appear only for the selected person.
      if (onSelectOnly(l)) path.classList.toggle('is-hidden', !on);
    });
    Object.entries(cards).forEach(([id, el]) => {
      const linked = selected && LINKS.some(l =>
        (l.from === selected && l.to === id) || (l.to === selected && l.from === id));
      el.classList.toggle('is-selected', id === selected);
      el.classList.toggle('is-linked', !!linked);
    });
  }

  function personLink(id) {
    return `<a href="#" data-goto="${id}">${byId[id].name}</a>`;
  }

  function select(id) {
    selected = id;
    const p = byId[id];
    const rels = LINKS.filter(l => l.from === id || l.to === id).map(l => {
      const other = l.from === id ? l.to : l.from;
      const dir = l.from === id ? '→' : '←';
      return `<li><span class="lineage-chip chip-${l.type}">${LINK_TYPES[l.type]}</span>
        ${dir} ${personLink(other)} <span class="lineage-rel-label">— ${l.label}</span></li>`;
    }).join('');
    detail.innerHTML = `
      <div class="lineage-detail-head">
        ${p.deva ? `<div class="lineage-detail-deva">${p.deva}</div>` : ''}
        <h2>${p.name}</h2>
        <div class="lineage-detail-meta">${p.dates}${p.born ? ` · born ${p.born}` : ''}${p.place ? ` · ${p.place}` : ''}</div>
        <div class="lineage-detail-role">${p.role}</div>
      </div>
      ${p.etym ? `<p class="lineage-detail-etym"><strong>Name:</strong> ${p.etym}</p>` : ''}
      <p>${p.summary}</p>
      ${p.caveat ? `<p class="lineage-detail-caveat">${p.caveat}</p>` : ''}
      <h3>Connections</h3>
      <ul class="lineage-rels">${rels}</ul>`;
    detail.hidden = false;
    highlight();
    if (window.innerWidth < 900) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-goto]');
    if (!a) return;
    e.preventDefault();
    select(a.dataset.goto);
    cards[a.dataset.goto].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  });

  // "Between the lineages" cards
  crossList.innerHTML = LINKS.filter(l => l.cross).map(l => `
    <div class="lineage-cross-card">
      <span class="lineage-chip chip-${l.type}">${LINK_TYPES[l.type]}</span>
      <h3>${personLink(l.from)} <span class="lineage-cross-arrow">⇄</span> ${personLink(l.to)}</h3>
      <div class="lineage-cross-label">${l.label}</div>
      <p>${l.detail}</p>
    </div>`).join('');

  // Legend
  document.getElementById('lineage-legend').innerHTML = Object.entries(LINK_TYPES).map(([k, v]) =>
    `<span class="legend-item"><svg width="34" height="10"><path d="M2,5 L32,5" class="lineage-edge edge-${k}"/></svg>${v}${k === 'parallel' ? ' (on selection)' : ''}</span>`
  ).join('') + '<span class="legend-item"><span class="legend-inst"></span>Institution</span><span class="legend-item"><span class="legend-inst legend-order"></span>Daśanāmī order</span>';

  drawEdges();
  if (document.fonts) document.fonts.ready.then(() => { drawEdges(); applyZoom(); });
  window.addEventListener('resize', () => { drawEdges(); applyZoom(); });
  applyZoom();
})();
