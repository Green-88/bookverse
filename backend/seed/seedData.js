const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const genres = [
  { name: 'Fiction', description: 'Character-driven stories and imaginative narratives.' },
  { name: 'Mystery', description: 'Suspenseful stories built around clues and revelations.' },
  { name: 'Romance', description: 'Emotion-forward stories focused on relationships.' },
  { name: 'Thriller', description: 'Fast-paced stories with tension and high stakes.' },
  { name: 'Self-help', description: 'Practical books focused on growth and habits.' },
  { name: 'Biography', description: 'Life stories of remarkable people.' },
  { name: 'History', description: 'Books exploring the past and its impact.' },
  { name: 'Fantasy', description: 'World-building, magic, and epic adventures.' },
  { name: 'Science Fiction', description: 'Speculative stories about science and the future.' },
  { name: 'Spiritual', description: 'Books centered on meaning, purpose, and reflection.' },
  { name: 'Poetry', description: 'Lyrical writing and verse collections.' },
  { name: 'Hindi Literature', description: 'Classic and contemporary Hindi literary works.' },
  { name: 'Philosophy', description: 'Thought-provoking explorations of ideas and existence.' },
  { name: 'Motivation', description: 'Books designed to inspire momentum and discipline.' },
  { name: 'Business', description: 'Strategy, leadership, productivity, and economics.' }
];

const authors = [
  {
    name: 'Premchand',
    bio: 'A foundational voice in modern Hindi and Urdu fiction, celebrated for realism and social insight.',
    image: 'https://picsum.photos/seed/premchand/400/400',
    nationality: 'Indian',
    famousBooks: ['Godaan', 'Gaban'],
    genres: ['Hindi Literature', 'Fiction']
  },
  {
    name: 'Harivansh Rai Bachchan',
    bio: 'A major Hindi poet remembered for evocative imagery, rhythm, and emotional resonance.',
    image: 'https://picsum.photos/seed/bachchan/400/400',
    nationality: 'Indian',
    famousBooks: ['Madhushala', 'Nisha Nimantran'],
    genres: ['Poetry', 'Hindi Literature']
  },
  {
    name: 'Ramdhari Singh Dinkar',
    bio: 'A powerful Hindi poet and essayist known for patriotic fire and classical cadence.',
    image: 'https://picsum.photos/seed/dinkar/400/400',
    nationality: 'Indian',
    famousBooks: ['Rashmirathi', 'Urvashi'],
    genres: ['Poetry', 'Hindi Literature']
  },
  {
    name: 'Mahadevi Verma',
    bio: 'A cornerstone of Chhayavaad, blending sensitivity, symbolism, and a distinct lyrical voice.',
    image: 'https://picsum.photos/seed/mahadevi/400/400',
    nationality: 'Indian',
    famousBooks: ['Yama', 'Aatmeera'],
    genres: ['Poetry', 'Hindi Literature']
  },
  {
    name: 'Dharamveer Bharati',
    bio: 'An influential Hindi writer and dramatist admired for philosophical depth and theatrical power.',
    image: 'https://picsum.photos/seed/bharati/400/400',
    nationality: 'Indian',
    famousBooks: ['Andha Yug', 'Gunahon Ka Devta'],
    genres: ['Fiction', 'Hindi Literature']
  },
  {
    name: 'Bhisham Sahni',
    bio: 'A celebrated novelist and playwright whose work confronts history, memory, and social rupture.',
    image: 'https://picsum.photos/seed/bhisham/400/400',
    nationality: 'Indian',
    famousBooks: ['Tamas', 'Parchhaiyan'],
    genres: ['History', 'Hindi Literature']
  },
  {
    name: 'Amrita Pritam',
    bio: 'A towering Punjabi and Hindi literary figure known for courage, longing, and lyrical power.',
    image: 'https://picsum.photos/seed/amrita/400/400',
    nationality: 'Indian',
    famousBooks: ['Pinjar', 'Kagaz Te Canvas'],
    genres: ['Romance', 'Poetry']
  },
  {
    name: 'Jaishankar Prasad',
    bio: 'A poet, dramatist, and novelist whose work shaped the modern Hindi literary imagination.',
    image: 'https://picsum.photos/seed/prasad/400/400',
    nationality: 'Indian',
    famousBooks: ['Kamayani', 'Skanda Gupta'],
    genres: ['Poetry', 'History']
  },
  {
    name: 'J.K. Rowling',
    bio: 'The globally beloved author behind a generation-defining fantasy universe.',
    image: 'https://picsum.photos/seed/rowling/400/400',
    nationality: 'British',
    famousBooks: ["Harry Potter and the Philosopher's Stone", 'Harry Potter and the Chamber of Secrets'],
    genres: ['Fantasy', 'Fiction']
  },
  {
    name: 'George Orwell',
    bio: 'A defining political writer whose fiction continues to shape cultural and political discourse.',
    image: 'https://picsum.photos/seed/orwell/400/400',
    nationality: 'British',
    famousBooks: ['1984', 'Animal Farm'],
    genres: ['Fiction', 'Philosophy']
  },
  {
    name: 'Paulo Coelho',
    bio: 'An internationally read author of spiritual and philosophical fiction.',
    image: 'https://picsum.photos/seed/coelho/400/400',
    nationality: 'Brazilian',
    famousBooks: ['The Alchemist', 'Brida'],
    genres: ['Spiritual', 'Fiction']
  },
  {
    name: 'Stephen King',
    bio: 'A master of suspense, horror, and commercial storytelling with enormous cultural reach.',
    image: 'https://picsum.photos/seed/king/400/400',
    nationality: 'American',
    famousBooks: ['The Shining', 'It'],
    genres: ['Thriller', 'Mystery']
  },
  {
    name: 'Agatha Christie',
    bio: 'The iconic queen of mystery fiction, famous for intricate puzzles and elegant misdirection.',
    image: 'https://picsum.photos/seed/christie/400/400',
    nationality: 'British',
    famousBooks: ['Murder on the Orient Express', 'And Then There Were None'],
    genres: ['Mystery', 'Thriller']
  },
  {
    name: 'Dan Brown',
    bio: 'A bestselling thriller author known for cryptic puzzles and global conspiracies.',
    image: 'https://picsum.photos/seed/brown/400/400',
    nationality: 'American',
    famousBooks: ['The Da Vinci Code', 'Angels & Demons'],
    genres: ['Thriller', 'Mystery']
  },
  {
    name: 'James Clear',
    bio: 'A leading voice in habits and behavior change for modern productivity.',
    image: 'https://picsum.photos/seed/clear/400/400',
    nationality: 'American',
    famousBooks: ['Atomic Habits', 'The 1% Edge'],
    genres: ['Self-help', 'Motivation']
  },
  {
    name: 'Robin Sharma',
    bio: 'A globally popular author who blends leadership, spirituality, and personal excellence.',
    image: 'https://picsum.photos/seed/sharma/400/400',
    nationality: 'Canadian',
    famousBooks: ['The Monk Who Sold His Ferrari', 'The 5 AM Club'],
    genres: ['Motivation', 'Self-help']
  },
  {
    name: 'Yuval Noah Harari',
    bio: 'A historian and thinker whose books explore humanity, society, and the future.',
    image: 'https://picsum.photos/seed/harari/400/400',
    nationality: 'Israeli',
    famousBooks: ['Sapiens', 'Homo Deus'],
    genres: ['History', 'Philosophy']
  },
  {
    name: 'Khaled Hosseini',
    bio: 'A novelist known for deeply human stories rooted in Afghanistan and diaspora experience.',
    image: 'https://picsum.photos/seed/hosseini/400/400',
    nationality: 'Afghan-American',
    famousBooks: ['The Kite Runner', 'A Thousand Splendid Suns'],
    genres: ['Fiction', 'Romance']
  }
];

const baseBooks = [
  { title: 'Godaan', author: 'Premchand', genre: 'Hindi Literature', language: 'Hindi', description: 'A landmark realist novel about agrarian life, dignity, and survival.', publicationYear: 1936, pages: 416, isbn: '9780000000010', rating: 4.8, tags: ['social realism', 'classic', 'Hindi'], isTrending: true, isBestseller: true },
  { title: 'Gaban', author: 'Premchand', genre: 'Fiction', language: 'Hindi', description: 'A compelling story of desire, morality, and social pressure.', publicationYear: 1931, pages: 356, isbn: '9780000000011', rating: 4.6, tags: ['classic', 'moral drama', 'Hindi'], isTrending: true },
  { title: 'Madhushala', author: 'Harivansh Rai Bachchan', genre: 'Poetry', language: 'Hindi', description: 'A timeless poetic metaphor for life, longing, and intoxication.', publicationYear: 1935, pages: 128, isbn: '9780000000012', rating: 4.9, tags: ['poetry', 'lyrical', 'Hindi'], isTrending: true, isBestseller: true },
  { title: 'Nisha Nimantran', author: 'Harivansh Rai Bachchan', genre: 'Poetry', language: 'Hindi', description: 'A poetic collection reflecting night, solitude, and reflection.', publicationYear: 1957, pages: 152, isbn: '9780000000013', rating: 4.5, tags: ['poetry', 'reflection', 'Hindi'] },
  { title: 'Rashmirathi', author: 'Ramdhari Singh Dinkar', genre: 'Poetry', language: 'Hindi', description: 'An epic poem that gives Karna a majestic and tragic voice.', publicationYear: 1952, pages: 240, isbn: '9780000000014', rating: 4.9, tags: ['epic', 'poetry', 'Hindi'], isTrending: true },
  { title: 'Urvashi', author: 'Ramdhari Singh Dinkar', genre: 'Poetry', language: 'Hindi', description: 'A philosophical poetic work balancing desire and transcendence.', publicationYear: 1961, pages: 200, isbn: '9780000000015', rating: 4.6, tags: ['poetry', 'philosophy', 'Hindi'] },
  { title: 'Yama', author: 'Mahadevi Verma', genre: 'Poetry', language: 'Hindi', description: 'A collection filled with inner life, grief, and luminous imagery.', publicationYear: 1936, pages: 144, isbn: '9780000000016', rating: 4.7, tags: ['poetry', 'women writers', 'Hindi'] },
  { title: 'Aatmeera', author: 'Mahadevi Verma', genre: 'Biography', language: 'Hindi', description: 'A reflective and intimate literary memoir of a defining voice.', publicationYear: 1943, pages: 176, isbn: '9780000000017', rating: 4.4, tags: ['memoir', 'poetry', 'Hindi'] },
  { title: 'Andha Yug', author: 'Dharamveer Bharati', genre: 'History', language: 'Hindi', description: 'A dramatic meditation on war, morality, and the collapse of civilization.', publicationYear: 1954, pages: 220, isbn: '9780000000018', rating: 4.8, tags: ['drama', 'epic', 'Hindi'], isTrending: true },
  { title: 'Gunahon Ka Devta', author: 'Dharamveer Bharati', genre: 'Romance', language: 'Hindi', description: 'A deeply loved novel about sacrifice, love, and emotional restraint.', publicationYear: 1949, pages: 288, isbn: '9780000000019', rating: 4.7, tags: ['romance', 'classic', 'Hindi'] },
  { title: 'Tamas', author: 'Bhisham Sahni', genre: 'History', language: 'Hindi', description: 'A powerful novel about Partition and the human cost of communal violence.', publicationYear: 1974, pages: 360, isbn: '9780000000020', rating: 4.9, tags: ['partition', 'history', 'Hindi'], isBestseller: true },
  { title: 'Parchhaiyan', author: 'Bhisham Sahni', genre: 'Fiction', language: 'Hindi', description: 'A set of stories reflecting memory, conflict, and the ordinary world.', publicationYear: 1963, pages: 224, isbn: '9780000000021', rating: 4.5, tags: ['short stories', 'Hindi', 'classic'] },
  { title: 'Pinjar', author: 'Amrita Pritam', genre: 'Romance', language: 'Hindi', description: 'A haunting novel about trauma, belonging, and resilience during Partition.', publicationYear: 1950, pages: 208, isbn: '9780000000022', rating: 4.8, tags: ['partition', 'romance', 'Hindi'], isTrending: true },
  { title: 'Kagaz Te Canvas', author: 'Amrita Pritam', genre: 'Poetry', language: 'Hindi', description: 'A poetic and contemplative collection from one of the region’s greatest voices.', publicationYear: 1970, pages: 192, isbn: '9780000000023', rating: 4.6, tags: ['poetry', 'memoir', 'Hindi'] },
  { title: 'Kamayani', author: 'Jaishankar Prasad', genre: 'Poetry', language: 'Hindi', description: 'A modern epic blending mythology, philosophy, and human introspection.', publicationYear: 1936, pages: 320, isbn: '9780000000024', rating: 4.8, tags: ['epic', 'poetry', 'Hindi'], isBestseller: true },
  { title: 'Skanda Gupta', author: 'Jaishankar Prasad', genre: 'History', language: 'Hindi', description: 'A dramatic work rooted in history, duty, and classical grandeur.', publicationYear: 1928, pages: 240, isbn: '9780000000025', rating: 4.4, tags: ['drama', 'history', 'Hindi'] },
  { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', genre: 'Fantasy', language: 'English', description: 'The legendary first journey into Hogwarts, friendship, and magic.', publicationYear: 1997, pages: 223, isbn: '9780000000026', rating: 4.9, tags: ['magic', 'coming of age', 'fantasy'], isTrending: true, isBestseller: true },
  { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', genre: 'Fantasy', language: 'English', description: 'A darker and more mysterious second year at Hogwarts.', publicationYear: 1998, pages: 251, isbn: '9780000000027', rating: 4.8, tags: ['magic', 'fantasy', 'adventure'], isBestseller: true },
  { title: '1984', author: 'George Orwell', genre: 'Philosophy', language: 'English', description: 'A defining dystopian novel about surveillance, truth, and control.', publicationYear: 1949, pages: 328, isbn: '9780000000028', rating: 4.9, tags: ['dystopian', 'political', 'classic'], isTrending: true, isBestseller: true },
  { title: 'Animal Farm', author: 'George Orwell', genre: 'Fiction', language: 'English', description: 'A sharp allegorical tale of power, propaganda, and betrayal.', publicationYear: 1945, pages: 112, isbn: '9780000000029', rating: 4.8, tags: ['allegory', 'political', 'classic'] },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Spiritual', language: 'English', description: 'A global favorite about destiny, courage, and listening to your dreams.', publicationYear: 1988, pages: 208, isbn: '9780000000030', rating: 4.8, tags: ['journey', 'spiritual', 'motivation'], isTrending: true, isBestseller: true },
  { title: 'Brida', author: 'Paulo Coelho', genre: 'Spiritual', language: 'English', description: 'A mystical novel about learning, love, and the search for meaning.', publicationYear: 1990, pages: 288, isbn: '9780000000031', rating: 4.4, tags: ['spiritual', 'self-discovery', 'fiction'] },
  { title: 'The Shining', author: 'Stephen King', genre: 'Thriller', language: 'English', description: 'A chilling psychological horror classic set in an isolated hotel.', publicationYear: 1977, pages: 447, isbn: '9780000000032', rating: 4.8, tags: ['horror', 'psychological', 'classic'], isTrending: true },
  { title: 'It', author: 'Stephen King', genre: 'Thriller', language: 'English', description: 'A sprawling terror saga of childhood fear and dark memory.', publicationYear: 1986, pages: 1138, isbn: '9780000000033', rating: 4.7, tags: ['horror', 'thriller', 'epic'], isBestseller: true },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', genre: 'Mystery', language: 'English', description: 'Poirot investigates a murder on a snowbound luxury train.', publicationYear: 1934, pages: 256, isbn: '9780000000034', rating: 4.9, tags: ['detective', 'mystery', 'classic'], isTrending: true },
  { title: 'And Then There Were None', author: 'Agatha Christie', genre: 'Mystery', language: 'English', description: 'Ten strangers, one island, and an escalating game of suspicion.', publicationYear: 1939, pages: 272, isbn: '9780000000035', rating: 4.9, tags: ['mystery', 'thriller', 'classic'], isBestseller: true },
  { title: 'The Da Vinci Code', author: 'Dan Brown', genre: 'Thriller', language: 'English', description: 'A rapid conspiracy thriller packed with symbols and secrets.', publicationYear: 2003, pages: 689, isbn: '9780000000036', rating: 4.7, tags: ['mystery', 'codes', 'thriller'], isTrending: true, isBestseller: true },
  { title: 'Angels & Demons', author: 'Dan Brown', genre: 'Mystery', language: 'English', description: 'A race against time through hidden corridors of faith and science.', publicationYear: 2000, pages: 616, isbn: '9780000000037', rating: 4.5, tags: ['mystery', 'conspiracy', 'thriller'] },
  { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-help', language: 'English', description: 'A practical framework for small habit changes that compound over time.', publicationYear: 2018, pages: 320, isbn: '9780000000038', rating: 4.9, tags: ['habits', 'productivity', 'growth'], isTrending: true, isBestseller: true },
  { title: 'The 1% Edge', author: 'James Clear', genre: 'Motivation', language: 'English', description: 'A short-form companion inspired by the discipline of tiny improvements.', publicationYear: 2021, pages: 224, isbn: '9780000000039', rating: 4.4, tags: ['motivation', 'habits', 'growth'] },
  { title: 'The Monk Who Sold His Ferrari', author: 'Robin Sharma', genre: 'Motivation', language: 'English', description: 'A modern parable about purpose, discipline, and inner success.', publicationYear: 1997, pages: 198, isbn: '9780000000040', rating: 4.8, tags: ['motivation', 'leadership', 'spiritual'], isTrending: true, isBestseller: true },
  { title: 'The 5 AM Club', author: 'Robin Sharma', genre: 'Self-help', language: 'English', description: 'A productivity story centered on ritual, focus, and extraordinary mornings.', publicationYear: 2018, pages: 336, isbn: '9780000000041', rating: 4.5, tags: ['productivity', 'routine', 'motivation'] },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', language: 'English', description: 'A sweeping overview of human history, culture, and transformation.', publicationYear: 2011, pages: 464, isbn: '9780000000042', rating: 4.8, tags: ['history', 'humanity', 'philosophy'], isBestseller: true },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', genre: 'Philosophy', language: 'English', description: 'A provocative look at the future of humanity in a post-biological age.', publicationYear: 2015, pages: 450, isbn: '9780000000043', rating: 4.6, tags: ['future', 'philosophy', 'science'], isTrending: true },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', genre: 'Fiction', language: 'English', description: 'A moving story of friendship, guilt, and return set against Afghan history.', publicationYear: 2003, pages: 371, isbn: '9780000000044', rating: 4.9, tags: ['drama', 'friendship', 'literary fiction'], isTrending: true, isBestseller: true },
  { title: 'A Thousand Splendid Suns', author: 'Khaled Hosseini', genre: 'Romance', language: 'English', description: 'An emotionally rich novel about women, endurance, and hope.', publicationYear: 2007, pages: 372, isbn: '9780000000045', rating: 4.9, tags: ['women', 'family', 'drama'], isBestseller: true }
];

const editions = [
  { suffix: '', pageBoost: 0, yearBoost: 0, ratingBoost: 0.0 },
  { suffix: ' - Collector Edition', pageBoost: 24, yearBoost: 2, ratingBoost: 0.1 },
  { suffix: ' - Illustrated Edition', pageBoost: 18, yearBoost: 1, ratingBoost: 0.05 }
];

const generateBooks = () => {
  const books = [];

  baseBooks.forEach((baseBook, baseIndex) => {
    editions.forEach((edition, editionIndex) => {
      const title = `${baseBook.title}${edition.suffix}`;
      const slug = slugify(`${title}-${baseBook.author}-${editionIndex}`);
      const publicationYear = baseBook.publicationYear + edition.yearBoost;
      const pages = baseBook.pages + edition.pageBoost;
      const rating = Math.min(5, Number((baseBook.rating + edition.ratingBoost).toFixed(1)));

      books.push({
        title,
        author: baseBook.author,
        genre: baseBook.genre,
        language: baseBook.language,
        rating,
        description: `${baseBook.description} This ${edition.suffix ? edition.suffix.toLowerCase() : 'standard'} version is designed for premium BookVerse browsing.`,
        coverImage: `https://picsum.photos/seed/${slug}/600/900`,
        publicationYear,
        pages,
        isbn: `${baseBook.isbn}${editionIndex + 1}`,
        likesCount: 100 + baseIndex * 5 + editionIndex * 3,
        tags: [...baseBook.tags, edition.suffix ? edition.suffix.replace(/[^a-zA-Z ]/g, '').trim() : 'standard'].filter(Boolean),
        isTrending: editionIndex === 0 ? baseBook.isTrending : baseBook.isTrending && editionIndex === 1,
        isNewRelease: publicationYear >= 2022 || editionIndex === 2,
        isBestseller: baseBook.isBestseller || rating >= 4.8
      });
    });
  });

  return books;
};

module.exports = {
  genres,
  authors,
  books: generateBooks()
};
